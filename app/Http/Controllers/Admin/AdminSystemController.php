<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Services\BillingService;
use App\Support\AuditLogPresenter;
use App\Support\ListPagination;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminSystemController extends Controller
{
    public function index(BillingService $billing): Response
    {
        $billing->markOverdueInvoices();

        $todayStart = Carbon::now()->startOfDay();
        $weekStart = Carbon::now()->startOfWeek();

        return Inertia::render('admin/system/index', [
            'health' => [
                'database' => $this->databaseOk(),
                'queue' => config('queue.default'),
                'cache' => config('cache.default'),
                'app_env' => config('app.env'),
                'app_debug' => config('app.debug'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
            ],
            'platformStats' => [
                'organizations' => Organization::query()->count(),
                'audit_logs' => AuditLog::query()->withoutGlobalScopes()->count(),
            ],
            'recentAuditLogs' => AuditLog::query()
                ->withoutGlobalScopes()
                ->with(['user', 'auditable', 'organization'])
                ->latest()
                ->paginate(ListPagination::perPage(), pageName: 'audit_page')
                ->withQueryString()
                ->through(fn (AuditLog $log) => [
                    ...AuditLogPresenter::present($log),
                    'organization_id' => $log->organization_id,
                    'organization_name' => $log->organization?->name,
                ]),
            'auditStats' => [
                'total' => AuditLog::query()->withoutGlobalScopes()->count(),
                'today' => AuditLog::query()
                    ->withoutGlobalScopes()
                    ->where('created_at', '>=', $todayStart)
                    ->count(),
                'this_week' => AuditLog::query()
                    ->withoutGlobalScopes()
                    ->where('created_at', '>=', $weekStart)
                    ->count(),
                'with_changes' => AuditLog::query()
                    ->withoutGlobalScopes()
                    ->where(function ($query) {
                        $query->whereNotNull('old_values')
                            ->orWhereNotNull('new_values');
                    })
                    ->count(),
            ],
            'categoryCounts' => $this->auditCategoryCounts(),
            'commands' => [
                ['key' => 'loans:process-overdue', 'label' => 'Process overdue loan installments'],
            ],
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function auditCategoryCounts(): array
    {
        $counts = [
            'all' => AuditLog::query()->withoutGlobalScopes()->count(),
        ];

        foreach (AuditLogPresenter::CATEGORIES as $category) {
            $counts[$category] = AuditLog::query()
                ->withoutGlobalScopes()
                ->where('action', 'like', "{$category}.%")
                ->count();
        }

        return $counts;
    }

    private function databaseOk(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}

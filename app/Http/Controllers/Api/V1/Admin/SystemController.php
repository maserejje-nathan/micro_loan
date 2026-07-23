<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Services\BillingService;
use App\Support\AuditLogPresenter;
use App\Support\ListPagination;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SystemController extends Controller
{
    public function __invoke(BillingService $billing): JsonResponse
    {
        $billing->markOverdueInvoices();

        $todayStart = Carbon::now()->startOfDay();
        $weekStart = Carbon::now()->startOfWeek();

        $recentAuditLogs = AuditLog::query()
            ->withoutGlobalScopes()
            ->with(['user', 'auditable', 'organization'])
            ->latest()
            ->paginate(ListPagination::perPage());

        return response()->json([
            'health' => [
                'database' => $this->databaseOk(),
                'queue' => config('queue.default'),
                'cache' => config('cache.default'),
                'app_env' => config('app.env'),
                'app_debug' => (bool) config('app.debug'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'app_version' => config('app.version'),
            ],
            'platform_stats' => [
                'organizations' => Organization::query()->count(),
                'audit_logs' => AuditLog::query()->withoutGlobalScopes()->count(),
            ],
            'recent_audit_logs' => [
                'data' => $recentAuditLogs->getCollection()->map(
                    fn (AuditLog $log) => [
                        ...AuditLogPresenter::present($log),
                        'organization_id' => $log->organization_id,
                        'organization_name' => $log->organization?->name,
                    ],
                )->values(),
                'meta' => [
                    'current_page' => $recentAuditLogs->currentPage(),
                    'last_page' => $recentAuditLogs->lastPage(),
                    'per_page' => $recentAuditLogs->perPage(),
                    'total' => $recentAuditLogs->total(),
                ],
            ],
            'audit_stats' => [
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
            'category_counts' => $this->auditCategoryCounts(),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function auditCategoryCounts(): array
    {
        $counts = [];

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

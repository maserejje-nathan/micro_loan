<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\AuditLogPresenter;
use App\Support\ListPagination;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->string('category')->toString();
        $activeCategory = in_array($category, AuditLogPresenter::CATEGORIES, true)
            ? $category
            : null;

        $logs = AuditLog::query()
            ->with(['user', 'auditable'])
            ->when(
                $activeCategory,
                fn ($query) => $query->where('action', 'like', "{$activeCategory}.%"),
            )
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (AuditLog $log) => AuditLogPresenter::present($log));

        $todayStart = Carbon::now()->startOfDay();
        $weekStart = Carbon::now()->startOfWeek();

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
            'activeCategory' => $activeCategory,
            'categoryCounts' => AuditLogPresenter::categoryCounts(),
            'stats' => [
                'total' => AuditLog::query()->count(),
                'today' => AuditLog::query()
                    ->where('created_at', '>=', $todayStart)
                    ->count(),
                'this_week' => AuditLog::query()
                    ->where('created_at', '>=', $weekStart)
                    ->count(),
                'with_changes' => AuditLog::query()
                    ->where(function ($query) {
                        $query->whereNotNull('old_values')
                            ->orWhereNotNull('new_values');
                    })
                    ->count(),
            ],
        ]);
    }
}

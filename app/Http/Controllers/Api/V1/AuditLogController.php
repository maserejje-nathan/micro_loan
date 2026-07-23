<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AuditLogResource;
use App\Models\AuditLog;
use App\Support\AuditLogPresenter;
use App\Support\ListPagination;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
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
            ->paginate(ListPagination::perPage());

        $todayStart = Carbon::now()->startOfDay();
        $weekStart = Carbon::now()->startOfWeek();

        return response()->json([
            'data' => AuditLogResource::collection($logs)->resolve(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
            'active_category' => $activeCategory,
            'category_counts' => AuditLogPresenter::categoryCounts(),
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

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AdminDashboardResource;
use App\Http\Resources\Api\V1\DashboardResource;
use App\Services\AdminDashboardStatsService;
use App\Services\DashboardStatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(
        Request $request,
        DashboardStatsService $dashboard,
        AdminDashboardStatsService $adminDashboard,
    ): JsonResponse {
        if ($request->user()?->isSuperAdmin()) {
            return response()->json(
                AdminDashboardResource::make($adminDashboard->forPlatform())->resolve()
            );
        }

        return response()->json(
            DashboardResource::make($dashboard->forCurrentOrganization())->resolve()
        );
    }
}

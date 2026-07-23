<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\DashboardResource;
use App\Services\DashboardStatsService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(DashboardStatsService $dashboard): JsonResponse
    {
        return response()->json(
            DashboardResource::make($dashboard->forCurrentOrganization())->resolve()
        );
    }
}

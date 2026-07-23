<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardStatsService;
use App\Support\LoanCalculatorCatalog;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(AdminDashboardStatsService $dashboard): Response
    {
        $payload = $dashboard->forPlatform();

        return Inertia::render('admin/dashboard', [
            'stats' => $payload['stats'],
            'recentOrganizations' => $payload['recent_organizations'],
            'loanCalculator' => LoanCalculatorCatalog::forPublic(),
        ]);
    }
}

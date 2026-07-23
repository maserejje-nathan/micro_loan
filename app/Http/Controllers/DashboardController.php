<?php

namespace App\Http\Controllers;

use App\Services\DashboardStatsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(DashboardStatsService $dashboard): Response
    {
        $payload = $dashboard->forCurrentOrganization();

        return Inertia::render('dashboard', [
            'stats' => $payload['stats'],
            'recentApplications' => $payload['recent_applications'],
            'currency' => $payload['currency'],
            'loanCalculator' => $payload['loan_calculator'],
        ]);
    }
}

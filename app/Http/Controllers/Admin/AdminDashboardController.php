<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InvoiceStatus;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Support\LoanCalculatorCatalog;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'organizations' => Organization::query()->count(),
                'users' => User::query()->where('is_super_admin', false)->count(),
                'active_subscriptions' => Subscription::query()
                    ->whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Trialing])
                    ->count(),
                'open_invoices' => Invoice::query()
                    ->whereIn('status', [InvoiceStatus::Open, InvoiceStatus::Overdue])
                    ->count(),
                'mrr' => Subscription::query()
                    ->where('status', SubscriptionStatus::Active)
                    ->with('plan')
                    ->get()
                    ->sum(fn (Subscription $s) => $s->plan->billing_interval->value === 'yearly'
                        ? (int) round($s->plan->price / 12)
                        : $s->plan->price),
                'plans' => SubscriptionPlan::query()->where('is_active', true)->count(),
            ],
            'recentOrganizations' => Organization::query()
                ->withCount('users')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Organization $org) => [
                    'id' => $org->id,
                    'name' => $org->name,
                    'slug' => $org->slug,
                    'users_count' => $org->users_count,
                    'created_at' => $org->created_at->toDateTimeString(),
                ]),
            'loanCalculator' => LoanCalculatorCatalog::forPublic(),
        ]);
    }
}

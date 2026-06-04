<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Support\LoanCalculatorCatalog;
use App\Services\PlatformSettingsService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __invoke(Request $request, SubscriptionService $subscriptions): Response
    {
        $user = $request->user();
        $organization = $user?->currentOrganization;
        $subscription = $organization?->activeSubscription();

        return Inertia::render('welcome', [
            'content' => app(PlatformSettingsService::class)->welcomeForPublic(),
            'plans' => SubscriptionPlan::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (SubscriptionPlan $plan) => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'description' => $plan->description,
                    'price' => $plan->price,
                    'currency' => $plan->currency,
                    'billing_interval' => $plan->billing_interval->value,
                    'trial_days' => $plan->trial_days,
                    'max_users' => $plan->max_users,
                    'max_customers' => $plan->max_customers,
                    'max_active_loans' => $plan->max_active_loans,
                    'features' => $plan->features ?? [],
                ]),
            'subscription' => $subscription && $organization instanceof Organization
                ? [
                    'status' => $subscription->status->value,
                    'trial_ends_at' => $subscription->trial_ends_at?->toDateTimeString(),
                    'current_period_end' => $subscription->current_period_end?->toDateTimeString(),
                    'plan' => [
                        'name' => $subscription->plan->name,
                        'price' => $subscription->plan->price,
                        'currency' => $subscription->plan->currency,
                        'billing_interval' => $subscription->plan->billing_interval->value,
                        'features' => $subscription->plan->features ?? [],
                        'max_users' => $subscription->plan->max_users,
                        'max_customers' => $subscription->plan->max_customers,
                        'max_active_loans' => $subscription->plan->max_active_loans,
                    ],
                    'usage' => $subscriptions->usageFor($organization),
                ]
                : null,
            'loanCalculator' => LoanCalculatorCatalog::forPublic(),
        ]);
    }
}

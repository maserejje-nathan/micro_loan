<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\SubscriptionService;
use App\Support\ListPagination;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request, SubscriptionService $subscriptions): Response
    {
        /** @var Organization $organization */
        $organization = $request->user()->currentOrganization;
        abort_if($organization === null, 403);
        $subscription = $organization->activeSubscription();

        return Inertia::render('settings/billing', [
            'subscription' => $subscription ? [
                'status' => $subscription->status->value,
                'plan' => [
                    'name' => $subscription->plan->name,
                    'slug' => $subscription->plan->slug,
                    'price' => $subscription->plan->price,
                    'currency' => $subscription->plan->currency,
                    'billing_interval' => $subscription->plan->billing_interval->value,
                    'features' => $subscription->plan->features ?? [],
                    'max_users' => $subscription->plan->max_users,
                    'max_customers' => $subscription->plan->max_customers,
                    'max_active_loans' => $subscription->plan->max_active_loans,
                ],
                'trial_ends_at' => $subscription->trial_ends_at?->toDateTimeString(),
                'current_period_start' => $subscription->current_period_start?->toDateTimeString(),
                'current_period_end' => $subscription->current_period_end?->toDateTimeString(),
            ] : null,
            'usage' => $subscriptions->usageFor($organization),
            'invoices' => $organization->invoices()
                ->latest()
                ->paginate(ListPagination::perPage(), pageName: 'invoices_page')
                ->withQueryString()
                ->through(fn ($inv) => [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'amount' => $inv->amount,
                    'currency' => $inv->currency,
                    'status' => $inv->status->value,
                    'due_at' => $inv->due_at?->toDateTimeString(),
                    'paid_at' => $inv->paid_at?->toDateTimeString(),
                ]),
        ]);
    }
}

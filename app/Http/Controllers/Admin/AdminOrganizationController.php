<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrganizationSubscriptionRequest;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use App\Support\ListPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrganizationController extends Controller
{
    public function index(Request $request): Response
    {
        $billing = $request->string('billing')->toString();
        $activeBilling = in_array($billing, ['active', 'trialing', 'past_due', 'none'], true)
            ? $billing
            : null;
        $search = trim($request->string('search')->toString());

        $organizations = Organization::query()
            ->withCount(['users', 'customers'])
            ->with(['subscriptions' => fn ($q) => $q->latest()->limit(1)->with('plan')])
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('subdomain', 'like', "%{$search}%");
                }),
            )
            ->when(
                $activeBilling === 'active',
                fn ($query) => $query->whereHas(
                    'subscriptions',
                    fn ($q) => $q->where('status', SubscriptionStatus::Active),
                ),
            )
            ->when(
                $activeBilling === 'trialing',
                fn ($query) => $query->whereHas(
                    'subscriptions',
                    fn ($q) => $q->where('status', SubscriptionStatus::Trialing),
                ),
            )
            ->when(
                $activeBilling === 'past_due',
                fn ($query) => $query->whereHas(
                    'subscriptions',
                    fn ($q) => $q->where('status', SubscriptionStatus::PastDue),
                ),
            )
            ->when(
                $activeBilling === 'none',
                fn ($query) => $query->whereDoesntHave(
                    'subscriptions',
                    fn ($q) => $q->whereIn('status', [
                        SubscriptionStatus::Active,
                        SubscriptionStatus::Trialing,
                        SubscriptionStatus::PastDue,
                        SubscriptionStatus::Paused,
                    ]),
                ),
            )
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(function (Organization $org) {
                $subscription = $org->subscriptions->first();

                return [
                    'id' => $org->id,
                    'name' => $org->name,
                    'slug' => $org->slug,
                    'subdomain' => $org->subdomain,
                    'currency' => $org->currency,
                    'users_count' => $org->users_count,
                    'customers_count' => $org->customers_count,
                    'subscription_status' => $subscription?->status->value,
                    'plan_name' => $subscription?->plan->name,
                    'plan_price' => $subscription?->plan->price,
                    'created_at' => $org->created_at->toDateTimeString(),
                ];
            });

        return Inertia::render('admin/organizations/index', [
            'organizations' => $organizations,
            'filters' => [
                'billing' => $activeBilling,
                'search' => $search !== '' ? $search : null,
            ],
            'stats' => [
                'total' => Organization::query()->count(),
                'with_active_subscription' => Subscription::query()
                    ->whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Trialing])
                    ->distinct('organization_id')
                    ->count('organization_id'),
                'trialing' => Subscription::query()
                    ->where('status', SubscriptionStatus::Trialing)
                    ->distinct('organization_id')
                    ->count('organization_id'),
                'past_due' => Subscription::query()
                    ->where('status', SubscriptionStatus::PastDue)
                    ->distinct('organization_id')
                    ->count('organization_id'),
                'without_billing' => Organization::query()
                    ->whereDoesntHave(
                        'subscriptions',
                        fn ($q) => $q->whereIn('status', [
                            SubscriptionStatus::Active,
                            SubscriptionStatus::Trialing,
                            SubscriptionStatus::PastDue,
                            SubscriptionStatus::Paused,
                        ]),
                    )
                    ->count(),
            ],
        ]);
    }

    public function show(Organization $organization, SubscriptionService $subscriptions): Response
    {
        $organization->load(['users', 'subscriptions.plan']);

        $subscription = $organization->activeSubscription();

        return Inertia::render('admin/organizations/show', [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
                'subdomain' => $organization->subdomain,
                'email' => $organization->email,
                'currency' => $organization->currency,
                'created_at' => $organization->created_at->toDateTimeString(),
            ],
            'users' => $organization->users->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ]),
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status->value,
                'plan_id' => $subscription->subscription_plan_id,
                'plan_name' => $subscription->plan->name,
                'plan_price' => $subscription->plan->price,
                'billing_interval' => $subscription->plan->billing_interval->value,
                'trial_ends_at' => $subscription->trial_ends_at?->toDateTimeString(),
                'current_period_end' => $subscription->current_period_end?->toDateTimeString(),
                'canceled_at' => $subscription->canceled_at?->toDateTimeString(),
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
            'plans' => SubscriptionPlan::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'slug', 'price']),
            'statuses' => array_column(SubscriptionStatus::cases(), 'value'),
        ]);
    }

    public function updateSubscription(
        Organization $organization,
        UpdateOrganizationSubscriptionRequest $request,
        SubscriptionService $subscriptions,
    ): RedirectResponse {
        $plan = SubscriptionPlan::query()->findOrFail($request->validated('subscription_plan_id'));
        $status = SubscriptionStatus::from($request->validated('status'));

        $subscriptions->assignPlan($organization, $plan, $status);

        return back()->with('success', 'Subscription updated.');
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Admin\AdminOrganizationResource;
use App\Http\Resources\Api\V1\Admin\InvoiceResource;
use App\Models\Organization;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use App\Support\ListPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
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
            ->paginate(ListPagination::perPage());

        return AdminOrganizationResource::collection($organizations)
            ->additional([
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
            ])
            ->response();
    }

    public function show(Organization $organization, SubscriptionService $subscriptions): JsonResponse
    {
        $organization->load(['users', 'subscriptions.plan']);

        $subscription = $organization->activeSubscription();

        $invoices = $organization->invoices()
            ->latest()
            ->paginate(ListPagination::perPage(), pageName: 'invoices_page');

        return response()->json([
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
            ])->values(),
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
            'invoices' => InvoiceResource::collection($invoices),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use App\Support\ListPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $activeStatus = SubscriptionStatus::tryFrom($status)?->value;
        $search = trim($request->string('search')->toString());

        $subscriptions = Subscription::query()
            ->with(['organization', 'plan'])
            ->when(
                $activeStatus,
                fn ($query) => $query->where('status', $activeStatus),
            )
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search) {
                    $query->whereHas(
                        'organization',
                        fn ($q) => $q->where('name', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%"),
                    )->orWhereHas(
                        'plan',
                        fn ($q) => $q->where('name', 'like', "%{$search}%"),
                    );
                }),
            )
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (Subscription $s) => [
                'id' => $s->id,
                'status' => $s->status->value,
                'organization' => [
                    'id' => $s->organization->id,
                    'name' => $s->organization->name,
                    'slug' => $s->organization->slug,
                ],
                'plan' => [
                    'id' => $s->plan->id,
                    'name' => $s->plan->name,
                    'price' => $s->plan->price,
                    'currency' => $s->plan->currency,
                    'billing_interval' => $s->plan->billing_interval->value,
                ],
                'trial_ends_at' => $s->trial_ends_at?->toDateTimeString(),
                'current_period_start' => $s->current_period_start?->toDateTimeString(),
                'current_period_end' => $s->current_period_end?->toDateTimeString(),
                'canceled_at' => $s->canceled_at?->toDateTimeString(),
                'created_at' => $s->created_at->toDateTimeString(),
            ]);

        $activeSubscriptions = Subscription::query()
            ->with('plan')
            ->where('status', SubscriptionStatus::Active)
            ->get();

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'status' => $activeStatus,
                'search' => $search !== '' ? $search : null,
            ],
            'statuses' => array_column(SubscriptionStatus::cases(), 'value'),
            'stats' => [
                'total' => Subscription::query()->count(),
                'active' => Subscription::query()
                    ->where('status', SubscriptionStatus::Active)
                    ->count(),
                'trialing' => Subscription::query()
                    ->where('status', SubscriptionStatus::Trialing)
                    ->count(),
                'past_due' => Subscription::query()
                    ->where('status', SubscriptionStatus::PastDue)
                    ->count(),
                'paused' => Subscription::query()
                    ->where('status', SubscriptionStatus::Paused)
                    ->count(),
                'canceled' => Subscription::query()
                    ->where('status', SubscriptionStatus::Canceled)
                    ->count(),
                'mrr' => $activeSubscriptions->sum(
                    fn (Subscription $s) => $s->plan->billing_interval->value === 'yearly'
                        ? (int) round($s->plan->price / 12)
                        : $s->plan->price,
                ),
            ],
        ]);
    }

    public function cancel(Subscription $subscription, SubscriptionService $service): RedirectResponse
    {
        $service->cancel($subscription);

        return back()->with('success', 'Subscription cancelled.');
    }

    public function activate(Subscription $subscription, SubscriptionService $service): RedirectResponse
    {
        $service->activate($subscription);

        return back()->with('success', 'Subscription activated.');
    }

    public function renew(Subscription $subscription, SubscriptionService $service): RedirectResponse
    {
        $service->renewPeriod($subscription);

        return back()->with('success', 'Subscription renewed.');
    }
}

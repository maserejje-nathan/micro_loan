<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Models\Loan;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    public function __construct(protected BillingService $billing) {}

    public function startTrial(Organization $organization, ?SubscriptionPlan $plan = null): Subscription
    {
        $plan ??= SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->firstOrFail();

        $now = now();

        return Subscription::query()->create([
            'organization_id' => $organization->id,
            'subscription_plan_id' => $plan->id,
            'status' => SubscriptionStatus::Trialing,
            'trial_ends_at' => $now->copy()->addDays($plan->trial_days),
            'starts_at' => $now,
            'current_period_start' => $now,
            'current_period_end' => $plan->billing_interval->periodEndFrom($now),
        ]);
    }

    public function assignPlan(
        Organization $organization,
        SubscriptionPlan $plan,
        ?SubscriptionStatus $status = null,
    ): Subscription {
        return DB::transaction(function () use ($organization, $plan, $status) {
            $this->cancelActiveSubscriptions($organization);

            $now = now();
            $status ??= SubscriptionStatus::Active;

            return Subscription::query()->create([
                'organization_id' => $organization->id,
                'subscription_plan_id' => $plan->id,
                'status' => $status,
                'starts_at' => $now,
                'current_period_start' => $now,
                'current_period_end' => $plan->billing_interval->periodEndFrom($now),
                'trial_ends_at' => $status === SubscriptionStatus::Trialing
                    ? $now->copy()->addDays($plan->trial_days)
                    : null,
            ]);
        });
    }

    public function cancel(Subscription $subscription): Subscription
    {
        $subscription->update([
            'status' => SubscriptionStatus::Canceled,
            'canceled_at' => now(),
            'ends_at' => $subscription->current_period_end ?? now(),
        ]);

        return $subscription->fresh();
    }

    public function markPastDue(Subscription $subscription): Subscription
    {
        $subscription->update(['status' => SubscriptionStatus::PastDue]);

        return $subscription->fresh();
    }

    public function activate(Subscription $subscription): Subscription
    {
        $subscription->update([
            'status' => SubscriptionStatus::Active,
            'canceled_at' => null,
            'ends_at' => null,
        ]);

        return $subscription->fresh();
    }

    public function renewPeriod(Subscription $subscription): Subscription
    {
        $plan = $subscription->plan;
        $start = $subscription->current_period_end ?? now();

        $subscription->update([
            'status' => SubscriptionStatus::Active,
            'current_period_start' => $start,
            'current_period_end' => $plan->billing_interval->periodEndFrom(Carbon::parse($start)),
        ]);

        $this->billing->createSubscriptionInvoice($subscription);

        return $subscription->fresh();
    }

    protected function cancelActiveSubscriptions(Organization $organization): void
    {
        $organization->subscriptions()
            ->whereIn('status', [
                SubscriptionStatus::Trialing,
                SubscriptionStatus::Active,
                SubscriptionStatus::PastDue,
                SubscriptionStatus::Paused,
            ])
            ->each(fn (Subscription $sub) => $this->cancel($sub));
    }

    /**
     * @return array{users: int, customers: int, active_loans: int}
     */
    public function usageFor(Organization $organization): array
    {
        return [
            'users' => $organization->users()->count(),
            'customers' => $organization->customers()->withoutGlobalScopes()->where('organization_id', $organization->id)->count(),
            'active_loans' => Loan::query()
                ->withoutGlobalScopes()
                ->where('organization_id', $organization->id)
                ->where('status', 'active')
                ->count(),
        ];
    }

    public function withinPlanLimits(Organization $organization): bool
    {
        $subscription = $organization->activeSubscription();

        if ($subscription === null || ! $subscription->isUsable()) {
            return false;
        }

        $plan = $subscription->plan;
        $usage = $this->usageFor($organization);

        if ($plan->max_users !== null && $usage['users'] > $plan->max_users) {
            return false;
        }

        if ($plan->max_customers !== null && $usage['customers'] > $plan->max_customers) {
            return false;
        }

        if ($plan->max_active_loans !== null && $usage['active_loans'] > $plan->max_active_loans) {
            return false;
        }

        return true;
    }
}

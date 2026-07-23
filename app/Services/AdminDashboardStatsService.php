<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;

class AdminDashboardStatsService
{
    /**
     * @return array{
     *     stats: array{
     *         organizations: int,
     *         users: int,
     *         active_subscriptions: int,
     *         open_invoices: int,
     *         mrr: int,
     *         plans: int
     *     },
     *     recent_organizations: list<array{
     *         id: int,
     *         name: string,
     *         slug: string,
     *         users_count: int,
     *         created_at: string|null
     *     }>
     * }
     */
    public function forPlatform(): array
    {
        $mrr = (int) Subscription::query()
            ->where('status', SubscriptionStatus::Active)
            ->with('plan')
            ->get()
            ->sum(fn (Subscription $subscription) => $subscription->plan->billing_interval->value === 'yearly'
                ? (int) round($subscription->plan->price / 12)
                : $subscription->plan->price);

        $recentOrganizations = Organization::query()
            ->withCount('users')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Organization $organization) => [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
                'users_count' => $organization->users_count,
                'created_at' => $organization->created_at?->toDateTimeString(),
            ])
            ->all();

        return [
            'stats' => [
                'organizations' => Organization::query()->count(),
                'users' => User::query()->where('is_super_admin', false)->count(),
                'active_subscriptions' => Subscription::query()
                    ->whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Trialing])
                    ->count(),
                'open_invoices' => Invoice::query()
                    ->whereIn('status', [InvoiceStatus::Open, InvoiceStatus::Overdue])
                    ->count(),
                'mrr' => $mrr,
                'plans' => SubscriptionPlan::query()->where('is_active', true)->count(),
            ],
            'recent_organizations' => $recentOrganizations,
        ];
    }
}

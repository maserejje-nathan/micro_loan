<?php

namespace Database\Seeders;

use App\Enums\BillingInterval;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'For small lenders getting started.',
                'price' => 150_000,
                'currency' => 'UGX',
                'billing_interval' => BillingInterval::Monthly,
                'trial_days' => 14,
                'max_users' => 5,
                'max_customers' => 500,
                'max_active_loans' => 100,
                'features' => ['Core loan management', 'SMS notifications', 'Basic reports'],
                'sort_order' => 1,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Growing teams with more volume.',
                'price' => 450_000,
                'currency' => 'UGX',
                'billing_interval' => BillingInterval::Monthly,
                'trial_days' => 14,
                'max_users' => 20,
                'max_customers' => 5_000,
                'max_active_loans' => 1_000,
                'features' => ['Everything in Starter', 'Mobile money', 'PDF statements', 'Audit logs'],
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Unlimited scale and priority support.',
                'price' => 1_200_000,
                'currency' => 'UGX',
                'billing_interval' => BillingInterval::Monthly,
                'trial_days' => 30,
                'max_users' => null,
                'max_customers' => null,
                'max_active_loans' => null,
                'features' => ['Unlimited usage', 'Custom subdomain', 'Dedicated support'],
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::query()->updateOrCreate(
                ['slug' => $plan['slug']],
                [
                    ...$plan,
                    'billing_interval' => $plan['billing_interval']->value,
                    'is_active' => true,
                ],
            );
        }
    }
}

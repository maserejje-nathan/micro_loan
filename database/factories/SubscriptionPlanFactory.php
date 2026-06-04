<?php

namespace Database\Factories;

use App\Enums\BillingInterval;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(50_000, 500_000),
            'currency' => 'UGX',
            'billing_interval' => BillingInterval::Monthly,
            'trial_days' => 14,
            'max_users' => 10,
            'max_customers' => 1000,
            'max_active_loans' => 200,
            'features' => ['Loans', 'Reports'],
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}

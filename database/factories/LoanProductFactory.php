<?php

namespace Database\Factories;

use App\Enums\InterestType;
use App\Enums\RepaymentFrequency;
use App\Models\LoanProduct;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoanProduct>
 */
class LoanProductFactory extends Factory
{
    protected $model = LoanProduct::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->words(2, true).' Loan',
            'code' => strtoupper(fake()->unique()->lexify('???')),
            'min_amount' => 100_000,
            'max_amount' => 5_000_000,
            'interest_rate' => 10,
            'interest_type' => InterestType::Flat,
            'term_min_days' => 30,
            'term_max_days' => 365,
            'repayment_frequency' => RepaymentFrequency::Monthly,
            'grace_period_days' => 0,
            'processing_fee' => 0,
            'is_active' => true,
        ];
    }
}

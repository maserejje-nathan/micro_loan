<?php

namespace Database\Factories;

use App\Enums\CustomerEmploymentStatus;
use App\Enums\CustomerGender;
use App\Enums\CustomerIdType;
use App\Enums\CustomerStatus;
use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'reference_number' => 'CUS-'.fake()->unique()->numerify('######'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone' => fake()->numerify('2567########'),
            'email' => fake()->optional()->safeEmail(),
            'payment_reminder_channels' => ['sms'],
            'national_id' => fake()->optional()->numerify('CM#############'),
            'date_of_birth' => fake()->optional()->dateTimeBetween('-60 years', '-18 years'),
            'gender' => fake()->optional()->randomElement(CustomerGender::cases()),
            'nationality' => fake()->optional(0.7)->randomElement(['Ugandan', 'Kenyan', 'Tanzanian']),
            'id_type' => fake()->optional()->randomElement(CustomerIdType::cases()),
            'id_expiry_date' => fake()->optional()->dateTimeBetween('+1 year', '+10 years'),
            'district' => fake()->optional()->city(),
            'city' => fake()->optional()->city(),
            'address' => fake()->optional()->streetAddress(),
            'occupation' => fake()->optional()->jobTitle(),
            'employment_status' => fake()->optional()->randomElement(CustomerEmploymentStatus::cases()),
            'employer_name' => fake()->optional()->company(),
            'monthly_income' => fake()->optional()->numberBetween(200_000, 5_000_000),
            'next_of_kin_name' => fake()->optional()->name(),
            'next_of_kin_phone' => fake()->optional()->numerify('2567########'),
            'next_of_kin_relationship' => fake()->optional()->randomElement(['Spouse', 'Parent', 'Sibling']),
            'status' => CustomerStatus::Active,
        ];
    }
}

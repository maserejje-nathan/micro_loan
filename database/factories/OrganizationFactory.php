<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organization>
 */
class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Organization::generateSlug($name),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'currency' => 'UGX',
            'country' => 'UG',
        ];
    }
}

<?php

use App\Models\Customer;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('authenticated lender can list customers via api', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);

    Customer::factory()->count(2)->create([
        'organization_id' => $organization->id,
    ]);

    Sanctum::actingAs($user->fresh());

    $this->getJson('/api/v1/customers')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                ['id', 'reference_number', 'full_name', 'phone', 'status'],
            ],
            'meta' => ['current_page', 'last_page', 'total'],
        ])
        ->assertJsonPath('meta.total', 2);
});

test('guest cannot list customers via api', function () {
    $this->getJson('/api/v1/customers')->assertUnauthorized();
});

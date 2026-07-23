<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('authenticated lender can list loans via api', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);

    Sanctum::actingAs($user->fresh());

    $this->getJson('/api/v1/loans')
        ->assertOk()
        ->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'total'],
        ]);
});

test('authenticated lender can list loan applications via api', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);

    Sanctum::actingAs($user->fresh());

    $this->getJson('/api/v1/loan-applications')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

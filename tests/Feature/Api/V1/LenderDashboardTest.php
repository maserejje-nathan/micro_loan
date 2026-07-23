<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('authenticated lender can fetch dashboard stats via api', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);

    Sanctum::actingAs($user->fresh());

    $this->getJson('/api/v1/dashboard')
        ->assertOk()
        ->assertJsonPath('type', 'lender')
        ->assertJsonStructure([
            'type',
            'stats' => [
                'active_loans',
                'pending_applications',
                'total_customers',
                'portfolio_outstanding',
                'repayments_this_month',
            ],
            'recent_applications',
            'currency',
        ]);
});

test('guest cannot fetch dashboard via api', function () {
    $this->getJson('/api/v1/dashboard')->assertUnauthorized();
});

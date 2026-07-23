<?php

use App\Models\User;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users without organization are redirected to onboarding', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertRedirect(route('onboarding.organization'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('stats.active_loans')
            ->has('stats.pending_applications')
            ->has('stats.total_customers')
            ->has('stats.portfolio_outstanding')
            ->has('stats.repayments_this_month')
            ->has('recentApplications')
            ->has('currency')
            ->has('loanCalculator')
            ->has('loanCalculator.products')
            ->has('loanCalculator.defaults'));
});

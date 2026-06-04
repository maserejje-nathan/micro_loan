<?php

use App\Models\User;
use Database\Seeders\SubscriptionPlanSeeder;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->seed(SubscriptionPlanSeeder::class);
});

test('home page shows subscription plans', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('plans', 3)
            ->has('loanCalculator')
            ->where('subscription', null));
});

test('home page shows current subscription for authenticated user with organization', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('plans', 3)
            ->has('subscription')
            ->where('subscription.status', 'trialing')
            ->has('subscription.plan')
            ->has('subscription.usage'));
});

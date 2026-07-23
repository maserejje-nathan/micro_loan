<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('lender can authenticate via api and receive a token', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);

    $response = $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'lender-test',
    ]);

    $response->assertOk()
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('user.email', $user->email)
        ->assertJsonStructure([
            'token',
            'token_type',
            'user' => ['id', 'name', 'email', 'organization'],
        ]);

    expect($response->json('token'))->not->toBeEmpty();
});

test('lender cannot authenticate with invalid password via api', function () {
    $user = User::factory()->create();

    $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('authenticated lender can fetch profile via api', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);

    Sanctum::actingAs($user->fresh());

    $this->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonPath('user.email', $user->email)
        ->assertJsonPath('user.organization.slug', $organization->slug)
        ->assertJsonStructure(['user', 'permissions']);
});

test('authenticated lender can logout via api', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);

    $login = $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'lender-test',
    ])->assertOk();

    $token = $login->json('token');

    $this->withToken($token)
        ->postJson('/api/v1/logout')
        ->assertOk()
        ->assertJsonPath('message', 'Signed out.');

    $this->app['auth']->forgetGuards();

    $this->withToken($token)
        ->getJson('/api/v1/me')
        ->assertUnauthorized();
});

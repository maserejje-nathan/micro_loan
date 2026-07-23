<?php

use App\Models\Customer;
use App\Models\User;
use App\Services\CustomerPortalService;
use App\Support\OrganizationPortalSettings;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);

    OrganizationPortalSettings::merge($this->organization, [
        'enabled' => true,
        'allow_applications' => true,
        'allow_self_registration' => false,
    ]);

    $this->customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700111222',
    ]);

    app(CustomerPortalService::class)->enable($this->customer, 'portal-secret');
});

test('portal customer can authenticate via api and receive a token', function () {
    $response = $this->postJson('/api/v1/portal/login', [
        'phone' => '256700111222',
        'password' => 'portal-secret',
        'organization_slug' => $this->organization->slug,
        'device_name' => 'portal-test',
    ]);

    $response->assertOk()
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('customer.phone', '256700111222')
        ->assertJsonPath('organization.slug', $this->organization->slug)
        ->assertJsonStructure([
            'token',
            'token_type',
            'customer' => ['id', 'first_name', 'last_name', 'phone'],
            'organization' => ['id', 'name', 'slug', 'currency'],
        ])
        ->assertJsonMissingPath('customer.portal_password');

    expect($response->json('token'))->not->toBeEmpty();
});

test('portal login is rejected when portal is disabled for organization', function () {
    OrganizationPortalSettings::merge($this->organization, [
        'enabled' => false,
    ]);

    $this->postJson('/api/v1/portal/login', [
        'phone' => '256700111222',
        'password' => 'portal-secret',
        'organization_slug' => $this->organization->slug,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['phone']);
});

test('authenticated portal customer can fetch dashboard via api', function () {
    Sanctum::actingAs($this->customer->fresh());

    $this->getJson('/api/v1/portal/dashboard')
        ->assertOk()
        ->assertJsonPath('portal.enabled', true)
        ->assertJsonPath('stats.active_loans', 0)
        ->assertJsonPath('currency', $this->organization->currency ?? 'UGX')
        ->assertJsonStructure([
            'portal',
            'stats' => [
                'active_loans',
                'outstanding',
                'pending_applications',
                'draft_applications',
            ],
            'recent_loans',
            'recent_applications',
            'currency',
            'loan_calculator',
        ]);
});

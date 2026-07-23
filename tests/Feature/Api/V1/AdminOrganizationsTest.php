<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('super admin can list organizations via api', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/organizations')
        ->assertOk()
        ->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'total'],
        ]);
});

test('lender cannot access admin organizations via api', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);

    Sanctum::actingAs($user->fresh());

    $this->getJson('/api/v1/admin/organizations')->assertForbidden();
});

test('super admin can fetch system health via api', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/system')
        ->assertOk()
        ->assertJsonStructure([
            'health' => ['database', 'queue', 'cache'],
            'platform_stats' => ['organizations', 'audit_logs'],
        ]);
});

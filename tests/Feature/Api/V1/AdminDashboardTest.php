<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('super admin can fetch platform dashboard via api', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/dashboard')
        ->assertOk()
        ->assertJsonPath('type', 'admin')
        ->assertJsonStructure([
            'type',
            'stats' => [
                'organizations',
                'users',
                'active_subscriptions',
                'open_invoices',
                'mrr',
                'plans',
            ],
            'recent_organizations',
        ]);
});

test('super admin can fetch platform dashboard via admin api path', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/admin/dashboard')
        ->assertOk()
        ->assertJsonPath('type', 'admin');
});

test('super admin profile includes is_super_admin flag', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonPath('user.is_super_admin', true)
        ->assertJsonPath('permissions.0', '*');
});

<?php

use App\Models\User;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('authenticated users can view settings pages', function (string $route) {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $this->get(route($route))->assertOk();
})->with([
    'profile' => 'profile.edit',
    'appearance' => 'appearance.edit',
    'team' => 'settings.team.index',
    'billing' => 'settings.billing.index',
    'portal' => 'settings.portal.edit',
]);

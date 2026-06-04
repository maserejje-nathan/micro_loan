<?php

use App\Models\User;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('user with reports permission can view reports page', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $this->get(route('reports.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('portfolio')
            ->has('disbursementsByMonth')
            ->has('repaymentsByMonth')
            ->has('statementLoans'));
});

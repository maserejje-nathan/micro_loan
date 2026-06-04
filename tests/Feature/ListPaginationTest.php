<?php

use App\Models\Customer;
use App\Models\User;
use App\Support\ListPagination;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());
});

test('customer index paginates ten rows per page', function () {
    Customer::factory()
        ->count(11)
        ->create(['organization_id' => $this->organization->id]);

    $this->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customers/index')
            ->has('customers.data', ListPagination::PER_PAGE)
            ->where('customers.per_page', ListPagination::PER_PAGE)
            ->where('customers.total', 11)
            ->where('customers.last_page', 2)
            ->has('customers.links'));
});

test('customer index second page returns remaining rows', function () {
    Customer::factory()
        ->count(11)
        ->create(['organization_id' => $this->organization->id]);

    $this->get(route('customers.index', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customers/index')
            ->has('customers.data', 1)
            ->where('customers.current_page', 2));
});

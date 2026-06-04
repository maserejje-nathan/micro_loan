<?php

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\OrganizationContext;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());

    OrganizationContext::set($this->organization);

    $this->customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
    ]);

    app(AuditLogger::class)->log(
        'customer.created',
        $this->customer,
    );

    app(AuditLogger::class)->log(
        'customer.updated',
        $this->customer,
        ['first_name' => 'Jane'],
        ['first_name' => 'Janet'],
    );
});

test('audit logs index returns stats and presented entries', function () {
    $this->get(route('audit-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('audit-logs/index')
            ->where('activeCategory', null)
            ->has('stats', fn ($stats) => $stats
                ->where('total', 2)
                ->where('with_changes', 1)
                ->etc()
            )
            ->where('categoryCounts.customer', 2)
            ->has('logs.data', 2)
            ->has('logs.data.0', fn ($log) => $log
                ->has('action_label')
                ->has('category')
                ->has('entity_url')
                ->etc()
            )
        );
});

test('audit logs can be filtered by category', function () {
    AuditLog::query()->create([
        'organization_id' => $this->organization->id,
        'user_id' => $this->user->id,
        'action' => 'repayment.recorded',
        'auditable_type' => null,
        'auditable_id' => null,
    ]);

    $this->get(route('audit-logs.index', ['category' => 'customer']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('activeCategory', 'customer')
            ->has('logs.data', 2)
            ->where('logs.data.0.category', 'customer')
        );
});

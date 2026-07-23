<?php

use App\Enums\SubscriptionStatus;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\SubscriptionPlanSeeder;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->seed(SubscriptionPlanSeeder::class);
});

test('non super admins cannot access admin area', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $this->get(route('admin.dashboard'))->assertForbidden();
});

test('super admin can access admin dashboard', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('stats')
            ->has('recentOrganizations'));

    $this->get(route('admin.organizations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/organizations/index')
            ->has('stats')
            ->has('filters')
        );

    $this->get(route('admin.plans.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/plans/index')
            ->has('stats')
            ->has('filters')
            ->where('stats.mrr', fn ($mrr) => is_int($mrr))
        );

    $this->get(route('admin.invoices.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/invoices/index')
            ->has('stats')
            ->has('filters')
            ->has('statuses')
        );

    $this->get(route('admin.system.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/system/index')
            ->has('auditStats')
            ->has('recentAuditLogs')
            ->has('categoryCounts')
            ->has('platformStats')
            ->has('health.php_version')
        );

    $this->get(route('admin.subscriptions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/subscriptions/index')
            ->has('stats')
            ->has('filters')
            ->has('statuses')
            ->where('stats.mrr', fn ($mrr) => is_int($mrr))
        );
});

test('super admin can filter organizations by billing', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->get(route('admin.organizations.index', ['billing' => 'trialing']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('filters.billing', 'trialing'));
});

test('super admin can filter invoices by status', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->get(route('admin.invoices.index', ['status' => 'open']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('filters.status', 'open'));
});

test('super admin can filter subscriptions by status', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->get(route('admin.subscriptions.index', ['status' => 'active']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.status', 'active')
        );
});

test('super admin can manage subscription plans', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->post(route('admin.plans.store'), [
        'name' => 'Growth',
        'slug' => 'growth',
        'price' => 300000,
        'currency' => 'UGX',
        'billing_interval' => 'monthly',
        'trial_days' => 7,
        'is_active' => true,
        'sort_order' => 5,
    ])->assertRedirect(route('admin.plans.index'));

    expect(SubscriptionPlan::query()->where('slug', 'growth')->exists())->toBeTrue();
});

test('super admin can edit a subscription plan', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $plan = SubscriptionPlan::query()->where('slug', 'starter')->firstOrFail();

    $this->get(route('admin.plans.edit', $plan))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/plans/form')
            ->where('plan.id', $plan->id)
            ->where('plan.slug', 'starter')
            ->has('billingIntervals', 2)
        );

    $this->put(route('admin.plans.update', $plan), [
        'name' => 'Starter Plus',
        'slug' => 'starter',
        'description' => 'Updated starter plan',
        'price' => 175000,
        'currency' => 'UGX',
        'billing_interval' => 'monthly',
        'trial_days' => 21,
        'max_users' => 5,
        'max_customers' => null,
        'max_active_loans' => 50,
        'features' => "Team invitations\nPDF statements, SMS reminders",
        'is_active' => true,
        'sort_order' => 1,
    ])->assertRedirect(route('admin.plans.index'));

    $plan->refresh();

    expect($plan->name)->toBe('Starter Plus')
        ->and($plan->price)->toBe(175000)
        ->and($plan->trial_days)->toBe(21)
        ->and($plan->max_users)->toBe(5)
        ->and($plan->features)->toBe([
            'Team invitations',
            'PDF statements',
            'SMS reminders',
        ]);
});

test('organization owner can view billing settings', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $this->get(route('settings.billing.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/billing')
            ->has('subscription')
            ->has('usage')
            ->has('invoices'));
});

test('users without active subscription are redirected to billing', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);

    $organization->subscriptions()->latest()->first()?->update([
        'status' => SubscriptionStatus::Canceled,
        'ends_at' => now()->subDay(),
    ]);

    $this->actingAs($user->fresh());

    $this->get(route('dashboard'))
        ->assertRedirect(route('settings.billing.index'));
});

test('super admin bypasses subscription gate', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->setupOrganization($admin);
    $admin->organizations()->first()?->subscriptions()->delete();

    $this->actingAs($admin->fresh());

    $this->get(route('dashboard'))->assertOk();
});

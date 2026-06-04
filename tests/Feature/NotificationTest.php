<?php

use App\Enums\LoanApplicationStatus;
use App\Models\Customer;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\User;
use App\Services\InAppNotificationService;
use App\Services\LoanApplicationService;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('submitting a loan application notifies users who can approve', function () {
    $submitter = User::factory()->create();
    $approver = User::factory()->create();
    $organization = $this->setupOrganization($submitter);

    $organization->users()->attach($approver->id, [
        'role_id' => $organization->roles()->where('slug', 'owner')->first()->id,
    ]);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
    ]);
    $product = LoanProduct::factory()->create([
        'organization_id' => $organization->id,
    ]);

    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $organization->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'APP-NOTIF-001',
        'requested_amount' => 500_000,
        'term_days' => 90,
        'status' => LoanApplicationStatus::Draft,
        'created_by' => $submitter->id,
    ]);

    app(LoanApplicationService::class)->submit($application, $submitter);

    expect($approver->fresh()->unreadNotifications)->toHaveCount(1)
        ->and($approver->fresh()->unreadNotifications->first()->data['type'])
        ->toBe('loan_application.submitted')
        ->and($submitter->fresh()->unreadNotifications)->toHaveCount(0);
});

test('user can mark a notification as read', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $service = app(InAppNotificationService::class);
    $service->notify(
        $user,
        $service->payload(
            'general',
            'Test alert',
            'Something happened in your workspace.',
            '/dashboard',
            $user->current_organization_id,
        ),
    );

    $notification = $user->fresh()->unreadNotifications->first();

    $this->post(route('notifications.read', $notification->id))
        ->assertRedirect();

    expect($user->fresh()->unreadNotifications)->toHaveCount(0)
        ->and($user->fresh()->readNotifications)->toHaveCount(1);
});

test('notifications index is available to authenticated users', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $this->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications')
            ->has('unreadCount'));
});

test('mark all as read clears unread notifications for current organization', function () {
    $user = User::factory()->create();
    $this->setupOrganization($user);
    $this->actingAs($user->fresh());

    $service = app(InAppNotificationService::class);

    $service->notify(
        $user,
        $service->payload('general', 'One', 'First', null, $user->current_organization_id),
    );
    $service->notify(
        $user,
        $service->payload('general', 'Two', 'Second', null, $user->current_organization_id),
    );

    expect($user->fresh()->unreadNotifications)->toHaveCount(2);

    $this->post(route('notifications.read-all'))->assertRedirect();

    expect($user->fresh()->unreadNotifications)->toHaveCount(0);
});

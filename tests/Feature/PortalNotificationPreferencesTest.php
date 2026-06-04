<?php

use App\Models\Customer;
use App\Services\CustomerPortalService;
use App\Support\OrganizationPortalSettings;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = \App\Models\User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);

    OrganizationPortalSettings::merge($this->organization, [
        'enabled' => true,
        'allow_applications' => true,
        'allow_self_registration' => true,
    ]);
});

test('portal customer can update payment reminder channels', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000555',
        'payment_reminder_channels' => ['sms'],
    ]);

    app(CustomerPortalService::class)->enable($customer, 'borrower-pass');

    $this->post(route('portal.login.store'), [
        'phone' => $customer->phone,
        'password' => 'borrower-pass',
        'organization_slug' => $this->organization->slug,
    ])->assertRedirect(route('portal.dashboard'));

    $this->put(route('portal.profile.notification-preferences'), [
        'payment_reminder_channels' => [
            'sms' => true,
            'email' => true,
        ],
    ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($customer->fresh()->paymentReminderChannels())
        ->toBe(['sms', 'email']);
});

<?php

use App\Enums\SmsStatus;
use App\Models\SmsNotification;
use App\Models\User;
use App\Services\PlatformSettingsService;
use Illuminate\Support\Facades\Http;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($this->admin);
    $this->organization = $this->setupOrganization(User::factory()->create());
});

test('super admin can send test sms using log driver', function () {
    app(PlatformSettingsService::class)->updateNotifications([
        'sms_driver' => 'log',
        'enabled_types' => [],
    ]);

    $this->post(route('admin.settings.sms.test'), [
        'phone' => '256700000123',
        'message' => 'Hello from admin test',
    ])
        ->assertRedirect()
        ->assertSessionHas('success')
        ->assertSessionHas('integration_response', ['driver' => 'log']);

    $notification = SmsNotification::query()->latest('id')->first();

    expect($notification)->not->toBeNull()
        ->and($notification->recipient_phone)->toBe('256700000123')
        ->and($notification->message)->toBe('Hello from admin test')
        ->and($notification->type)->toBe('admin_test')
        ->and($notification->status)->toBe(SmsStatus::Sent);
});

test('super admin test sms fails validation for invalid phone', function () {
    $this->post(route('admin.settings.sms.test'), [
        'phone' => 'not-a-phone',
    ])
        ->assertSessionHasErrors('phone');
});

test('super admin can send test sms via africas talking when configured', function () {
    app(PlatformSettingsService::class)->updateNotifications([
        'sms_driver' => 'africas_talking',
    ]);

    app(PlatformSettingsService::class)->updateAfricasTalking([
        'username' => 'sandbox',
        'api_key' => 'test-key',
        'from' => 'LOAN',
        'endpoint' => 'https://api.africastalking.com/version1/messaging',
    ]);

    Http::fake([
        'api.africastalking.com/*' => Http::response([
            'SMSMessageData' => [
                'Recipients' => [['status' => 'Success', 'number' => '256700000123']],
            ],
        ], 201),
    ]);

    $this->post(route('admin.settings.sms.test'), [
        'phone' => '256700000123',
    ])
        ->assertRedirect()
        ->assertSessionHas('success')
        ->assertSessionHas('integration_response.SMSMessageData');

    expect(SmsNotification::query()->latest('id')->first()?->status)
        ->toBe(SmsStatus::Sent);
});

test('super admin test connection returns africa\'s talking api response', function () {
    app(PlatformSettingsService::class)->updateAfricasTalking([
        'username' => 'sandbox',
        'api_key' => 'test-key',
        'from' => 'LOAN',
        'endpoint' => 'https://api.africastalking.com/version1/messaging',
    ]);

    Http::fake([
        'api.africastalking.com/version1/user*' => Http::response([
            'UserData' => ['balance' => 'KES 10.00'],
        ], 200),
    ]);

    $this->post(route('admin.settings.africas-talking.test'))
        ->assertRedirect()
        ->assertSessionHas('success')
        ->assertSessionHas('integration_response', fn ($response) => $response['http_status'] === 200
            && $response['body']['UserData']['balance'] === 'KES 10.00');
});

test('non admin cannot send test sms', function () {
    $user = User::factory()->create(['is_super_admin' => false]);
    $this->actingAs($user);

    $this->post(route('admin.settings.sms.test'), [
        'phone' => '256700000123',
    ])->assertForbidden();
});

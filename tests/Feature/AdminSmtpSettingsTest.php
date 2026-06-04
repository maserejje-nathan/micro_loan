<?php

use App\Models\User;
use App\Services\PlatformSettingsService;
beforeEach(function () {
    $this->admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($this->admin);
});

test('super admin can view smtp settings page', function () {
    $this->get(route('admin.settings.smtp'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/settings/smtp')
            ->has('settings')
            ->has('status')
            ->has('mailDriver')
        );
});

test('super admin can update smtp settings', function () {
    $this->put(route('admin.settings.smtp.update'), [
        'mail_driver' => 'smtp',
        'host' => 'smtp.example.com',
        'port' => 587,
        'encryption' => 'tls',
        'username' => 'mailer',
        'password' => 'secret',
        'from_address' => 'noreply@example.com',
        'from_name' => 'Loan Platform',
    ])->assertRedirect();

    $smtp = app(PlatformSettingsService::class)->smtp();

    expect($smtp['mail_driver'])->toBe('smtp')
        ->and($smtp['host'])->toBe('smtp.example.com')
        ->and($smtp['from_address'])->toBe('noreply@example.com');
});

test('super admin can send test email using log driver', function () {
    app(PlatformSettingsService::class)->updateSmtp([
        'mail_driver' => 'log',
        'from_address' => 'test@example.com',
        'from_name' => 'Test',
    ]);

    $this->post(route('admin.settings.smtp.test'), [
        'email' => 'recipient@example.com',
    ])
        ->assertRedirect()
        ->assertSessionHas('success')
        ->assertSessionHas('integration_response', fn ($response) => $response['driver'] === 'log'
            && $response['to'] === 'recipient@example.com');
});

test('super admin test email requires valid address', function () {
    $this->post(route('admin.settings.smtp.test'), [
        'email' => 'not-an-email',
    ])->assertSessionHasErrors('email');
});

test('non admin cannot access smtp settings', function () {
    $user = User::factory()->create(['is_super_admin' => false]);
    $this->actingAs($user);

    $this->get(route('admin.settings.smtp'))->assertForbidden();
});

test('apply runtime config sets mail from platform smtp settings', function () {
    app(PlatformSettingsService::class)->updateSmtp([
        'mail_driver' => 'smtp',
        'host' => 'mail.example.org',
        'port' => 465,
        'encryption' => 'ssl',
        'username' => 'user',
        'password' => 'pass',
        'from_address' => 'hello@example.org',
        'from_name' => 'Hello',
    ]);

    expect(config('mail.default'))->toBe('smtp')
        ->and(config('mail.mailers.smtp.host'))->toBe('mail.example.org')
        ->and(config('mail.from.address'))->toBe('hello@example.org');
});

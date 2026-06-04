<?php

use App\Models\PlatformSetting;
use App\Models\User;
use App\Services\PlatformSettingsService;
use App\Support\PlatformSettingsDefaults;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('welcome page includes cms content', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('content')
            ->where('content.hero_headline_highlight', 'growing MFIs')
            ->has('content.banner_slides', 3)
        );
});

test('welcome page shares platform logo url', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('logoUrl', url('/images/logo.svg'))
        );
});

test('welcome page banner slides include resolved image urls', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where(
                'content.banner_slides.0.image_url',
                url('/images/welcome/banner-portfolio.svg'),
            )
            ->where(
                'content.banner_slides.0.caption',
                'Track every loan from application to repayment',
            )
        );
});

test('super admin can update welcome content', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->put(route('admin.settings.welcome.update'), [
        'meta_title' => 'Custom title',
        'hero_badge' => 'Badge',
        'hero_headline_prefix' => 'Prefix',
        'hero_headline_highlight' => 'Highlight',
        'hero_description' => 'Description text',
        'hero_primary_cta' => 'Go',
        'hero_secondary_cta' => 'Login',
        'highlights' => ['One', 'Two'],
        'cta_title' => 'CTA',
        'cta_description' => 'CTA body',
        'footer_tagline' => 'Footer',
        'popular_plan_slug' => 'starter',
        'logo_url' => PlatformSettingsDefaults::welcome()['logo_url'],
        'banner_slides' => PlatformSettingsDefaults::welcome()['banner_slides'],
        'steps' => PlatformSettingsDefaults::welcome()['steps'],
        'features' => PlatformSettingsDefaults::welcome()['features'],
    ])->assertRedirect();

    expect(PlatformSetting::query()->where('key', 'welcome')->exists())->toBeTrue();

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->where('content.meta_title', 'Custom title')
            ->where('content.hero_headline_highlight', 'Highlight')
        );
});

test('super admin can update notification settings', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->put(route('admin.settings.notifications.update'), [
        'sms_driver' => 'log',
        'enabled_types' => [
            'loan_approved' => true,
            'loan_rejected' => false,
            'loan_disbursed' => true,
            'repayment_received' => true,
            'overdue_reminder' => true,
        ],
    ])->assertRedirect();

    $settings = app(PlatformSettingsService::class)->notifications();

    expect($settings['sms_driver'])->toBe('log')
        ->and($settings['enabled_types']['loan_rejected'])->toBeFalse();
});

test('disabled notification types are not sent', function () {
    PlatformSetting::query()->create([
        'key' => PlatformSettingsService::KEY_NOTIFICATIONS,
        'value' => [
            'sms_driver' => 'log',
            'enabled_types' => array_fill_keys(
                array_keys(PlatformSettingsDefaults::NOTIFICATION_TYPES),
                false,
            ),
        ],
    ]);

    $service = app(PlatformSettingsService::class);
    $service->applyRuntimeConfig();

    expect($service->isNotificationTypeEnabled('loan_approved'))->toBeFalse();
});

test('super admin can upload platform logo', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $defaults = PlatformSettingsDefaults::welcome();

    $this->put(route('admin.settings.welcome.update'), [
        ...$defaults,
        'banner_slides' => $defaults['banner_slides'],
        'steps' => $defaults['steps'],
        'features' => $defaults['features'],
        'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
    ])->assertRedirect();

    $stored = app(PlatformSettingsService::class)->welcome();

    expect($stored['logo_path'] ?? null)->not->toBeNull();
    Storage::disk('public')->assertExists($stored['logo_path']);

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->where(
                'logoUrl',
                Storage::disk('public')->url($stored['logo_path']),
            )
        );
});

test('super admin can upload welcome banner slide image', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $defaults = PlatformSettingsDefaults::welcome();
    $slides = $defaults['banner_slides'];
    $slides[0]['image'] = UploadedFile::fake()->image('banner.jpg', 2100, 700);

    $payload = [
        ...$defaults,
        'banner_slides' => $slides,
        'steps' => $defaults['steps'],
        'features' => $defaults['features'],
    ];

    $this->put(route('admin.settings.welcome.update'), $payload)
        ->assertRedirect();

    $stored = app(PlatformSettingsService::class)->welcome();

    expect($stored['banner_slides'][0]['path'] ?? null)->not->toBeNull();
    Storage::disk('public')->assertExists($stored['banner_slides'][0]['path']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where(
                'content.banner_slides.0.image_url',
                Storage::disk('public')->url($stored['banner_slides'][0]['path']),
            )
        );
});

test('super admin can access platform settings hub', function () {
    $admin = User::factory()->create(['is_super_admin' => true]);
    $this->actingAs($admin);

    $this->get(route('admin.settings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/settings/index')
            ->has('yoStatus')
            ->has('africasTalkingStatus')
            ->has('smtpStatus')
            ->has('mailDriver')
        );
});

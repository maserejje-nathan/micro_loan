<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SendTestEmailRequest;
use App\Http\Requests\Admin\SendTestSmsRequest;
use App\Http\Requests\Admin\UpdateAfricasTalkingSettingsRequest;
use App\Http\Requests\Admin\UpdateNotificationSettingsRequest;
use App\Http\Requests\Admin\UpdateSmtpSettingsRequest;
use App\Http\Requests\Admin\UpdateWelcomeSettingsRequest;
use App\Http\Requests\Admin\UpdateYoPaymentsSettingsRequest;
use App\Services\IntegrationHealthService;
use App\Services\PlatformSettingsService;
use App\Services\PlatformLogoService;
use App\Services\WelcomeBannerService;
use App\Support\PlatformSettingsDefaults;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminPlatformSettingsController extends Controller
{
    public function index(IntegrationHealthService $health): Response
    {
        return Inertia::render('admin/settings/index', [
            'yoStatus' => $health->yoPaymentsStatus(),
            'africasTalkingStatus' => $health->africasTalkingStatus(),
            'smtpStatus' => $health->smtpStatus(),
            'notificationDriver' => config('sms.driver'),
            'mailDriver' => config('mail.default'),
            'mobileMoneyDriver' => config('payments.mobile_money_driver'),
        ]);
    }

    public function welcome(
        PlatformSettingsService $settings,
        WelcomeBannerService $banners,
        PlatformLogoService $logo,
    ): Response {
        $welcome = $settings->welcome();

        return Inertia::render('admin/settings/welcome', [
            'settings' => [
                ...$welcome,
                'logo' => $logo->forAdmin($welcome),
                'banner_slides' => $banners->slidesForAdmin(
                    is_array($welcome['banner_slides'] ?? null)
                        ? $welcome['banner_slides']
                        : PlatformSettingsDefaults::welcome()['banner_slides'],
                ),
            ],
        ]);
    }

    public function updateWelcome(
        UpdateWelcomeSettingsRequest $request,
        PlatformSettingsService $settings,
        WelcomeBannerService $banners,
        PlatformLogoService $logo,
    ): RedirectResponse {
        $validated = $request->validated();
        $welcome = $settings->welcome();
        $existingSlides = is_array($welcome['banner_slides'] ?? null)
            ? $welcome['banner_slides']
            : PlatformSettingsDefaults::welcome()['banner_slides'];

        $validated['banner_slides'] = $banners->mergeSlidesFromRequest(
            $validated['banner_slides'] ?? [],
            $request->allFiles(),
            $existingSlides,
        );

        $validated = $logo->mergeIntoWelcomeSettings($validated, $request, $welcome);

        unset($validated['logo'], $validated['remove_logo']);

        $settings->updateWelcome($validated);

        return back()->with('success', 'Welcome page content updated.');
    }

    public function notifications(
        PlatformSettingsService $settings,
        IntegrationHealthService $health,
    ): Response {
        $notificationSettings = $settings->notifications();

        return Inertia::render('admin/settings/notifications', [
            'settings' => $notificationSettings,
            'types' => collect(PlatformSettingsDefaults::NOTIFICATION_TYPES)
                ->map(fn (string $label, string $key) => [
                    'key' => $key,
                    'label' => $label,
                    'enabled' => (bool) ($notificationSettings['enabled_types'][$key] ?? true),
                ])
                ->values(),
            'smsDrivers' => [
                ['value' => 'log', 'label' => 'Log only (development)'],
                ['value' => 'africas_talking', 'label' => "Africa's Talking"],
            ],
            'africasTalkingStatus' => $health->africasTalkingStatus(),
            'smsDriver' => $health->smsDriverSummary(),
        ]);
    }

    public function updateNotifications(
        UpdateNotificationSettingsRequest $request,
        PlatformSettingsService $settings,
    ): RedirectResponse {
        $settings->updateNotifications($request->validated());

        return back()->with('success', 'Notification settings updated.');
    }

    public function yoPayments(
        PlatformSettingsService $settings,
        IntegrationHealthService $health,
    ): Response {
        return Inertia::render('admin/settings/yo-payments', [
            'settings' => $settings->yoPaymentsForAdmin(),
            'status' => $health->yoPaymentsStatus(),
            'drivers' => [
                ['value' => 'stub', 'label' => 'Stub (no real transfers)'],
                ['value' => 'yo', 'label' => 'Yo! Payments'],
            ],
        ]);
    }

    public function updateYoPayments(
        UpdateYoPaymentsSettingsRequest $request,
        PlatformSettingsService $settings,
    ): RedirectResponse {
        $settings->updateYoPayments($request->validated());

        return back()->with('success', 'Yo! Payments settings updated.');
    }

    public function testYoPayments(IntegrationHealthService $health): RedirectResponse
    {
        $result = $health->testYoPayments();

        return back()->with(
            $result['ok'] ? 'success' : 'error',
            $result['message'],
        );
    }

    public function africasTalking(
        PlatformSettingsService $settings,
        IntegrationHealthService $health,
    ): Response {
        return Inertia::render('admin/settings/africas-talking', [
            'settings' => $settings->africasTalkingForAdmin(),
            'status' => $health->africasTalkingStatus(),
            'smsDriver' => $health->smsDriverSummary(),
        ]);
    }

    public function updateAfricasTalking(
        UpdateAfricasTalkingSettingsRequest $request,
        PlatformSettingsService $settings,
    ): RedirectResponse {
        $settings->updateAfricasTalking($request->validated());

        return back()->with('success', "Africa's Talking settings updated.");
    }

    public function testAfricasTalking(IntegrationHealthService $health): RedirectResponse
    {
        $result = $health->testAfricasTalking();

        return $this->integrationTestRedirect($result);
    }

    public function testSms(
        SendTestSmsRequest $request,
        IntegrationHealthService $health,
    ): RedirectResponse {
        $result = $health->sendTestSms(
            $request->string('phone')->toString(),
            $request->filled('message') ? $request->string('message')->toString() : null,
        );

        return $this->integrationTestRedirect($result);
    }

    public function smtp(
        PlatformSettingsService $settings,
        IntegrationHealthService $health,
    ): Response {
        return Inertia::render('admin/settings/smtp', [
            'settings' => $settings->smtpForAdmin(),
            'status' => $health->smtpStatus(),
            'mailDriver' => $health->mailDriverSummary(),
            'drivers' => [
                ['value' => 'log', 'label' => 'Log only (development)'],
                ['value' => 'smtp', 'label' => 'SMTP'],
            ],
            'encryptionOptions' => [
                ['value' => '', 'label' => 'None'],
                ['value' => 'tls', 'label' => 'TLS'],
                ['value' => 'ssl', 'label' => 'SSL'],
            ],
        ]);
    }

    public function updateSmtp(
        UpdateSmtpSettingsRequest $request,
        PlatformSettingsService $settings,
    ): RedirectResponse {
        $settings->updateSmtp($request->validated());

        return back()->with('success', 'SMTP settings updated.');
    }

    public function testEmail(
        SendTestEmailRequest $request,
        IntegrationHealthService $health,
    ): RedirectResponse {
        $result = $health->sendTestEmail($request->string('email')->toString());

        return $this->integrationTestRedirect($result);
    }

    /**
     * @param  array{ok: bool, message: string, response?: array<string, mixed>|null}  $result
     */
    protected function integrationTestRedirect(array $result): RedirectResponse
    {
        $redirect = back()->with(
            $result['ok'] ? 'success' : 'error',
            $result['message'],
        );

        if (($result['response'] ?? null) !== null) {
            $redirect->with('integration_response', $result['response']);
        }

        return $redirect;
    }
}

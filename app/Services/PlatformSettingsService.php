<?php

namespace App\Services;

use App\Models\PlatformSetting;
use App\Support\PlatformSettingsDefaults;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;

class PlatformSettingsService
{
    public const KEY_WELCOME = 'welcome';

    public const KEY_NOTIFICATIONS = 'notifications';

    public const KEY_YO_PAYMENTS = 'yo_payments';

    public const KEY_AFRICAS_TALKING = 'africas_talking';

    public const KEY_SMTP = 'smtp';

    /**
     * @var array<string, array<string, mixed>>
     */
    protected array $memory = [];

    public function isAvailable(): bool
    {
        return Schema::hasTable('platform_settings');
    }

    /**
     * @return array<string, mixed>
     */
    public function welcome(): array
    {
        return $this->get(self::KEY_WELCOME, PlatformSettingsDefaults::welcome());
    }

    /**
     * @return array<string, mixed>
     */
    public function welcomeForPublic(): array
    {
        $welcome = $this->welcome();
        $appName = config('app.name');

        foreach (['hero_description', 'footer_tagline'] as $field) {
            if (isset($welcome[$field]) && is_string($welcome[$field])) {
                $welcome[$field] = str_replace('{app_name}', $appName, $welcome[$field]);
            }
        }

        $slides = is_array($welcome['banner_slides'] ?? null)
            ? $welcome['banner_slides']
            : PlatformSettingsDefaults::welcome()['banner_slides'];

        $welcome['banner_slides'] = app(WelcomeBannerService::class)->resolveForPublic($slides);

        return $welcome;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateWelcome(array $data): void
    {
        $this->put(self::KEY_WELCOME, array_merge($this->welcome(), $data));
    }

    /**
     * @return array<string, mixed>
     */
    public function notifications(): array
    {
        return $this->get(self::KEY_NOTIFICATIONS, PlatformSettingsDefaults::notifications());
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateNotifications(array $data): void
    {
        $current = $this->notifications();
        $enabled = $data['enabled_types'] ?? $current['enabled_types'];

        $this->put(self::KEY_NOTIFICATIONS, [
            'sms_driver' => $data['sms_driver'] ?? $current['sms_driver'],
            'enabled_types' => array_merge(
                $current['enabled_types'] ?? [],
                is_array($enabled) ? $enabled : [],
            ),
        ]);
    }

    public function isNotificationTypeEnabled(string $type): bool
    {
        $settings = $this->notifications();

        return (bool) ($settings['enabled_types'][$type] ?? true);
    }

    /**
     * @return array<string, mixed>
     */
    public function yoPayments(): array
    {
        $settings = $this->get(self::KEY_YO_PAYMENTS, PlatformSettingsDefaults::yoPayments());

        return $this->mergeYoFromEnv($settings);
    }

    /**
     * @return array<string, mixed>
     */
    public function yoPaymentsForAdmin(): array
    {
        $settings = $this->getRaw(self::KEY_YO_PAYMENTS) ?? [];
        $merged = array_merge(PlatformSettingsDefaults::yoPayments(), $settings);

        return [
            ...$this->mergeYoFromEnv($merged),
            'has_password' => filled($merged['password'] ?? null)
                || filled(env('YO_PAYMENTS_PASSWORD')),
            'password' => '',
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateYoPayments(array $data): void
    {
        $current = $this->getRaw(self::KEY_YO_PAYMENTS) ?? PlatformSettingsDefaults::yoPayments();

        $password = $data['password'] ?? null;
        if (filled($password)) {
            $current['password'] = Crypt::encryptString($password);
        }

        unset($data['password']);

        $this->put(self::KEY_YO_PAYMENTS, array_merge($current, $data));
    }

    /**
     * @return array<string, mixed>
     */
    public function africasTalking(): array
    {
        $settings = $this->get(self::KEY_AFRICAS_TALKING, PlatformSettingsDefaults::africasTalking());

        return $this->mergeAfricasTalkingFromEnv($settings);
    }

    /**
     * @return array<string, mixed>
     */
    public function africasTalkingForAdmin(): array
    {
        $settings = $this->getRaw(self::KEY_AFRICAS_TALKING) ?? [];
        $merged = array_merge(PlatformSettingsDefaults::africasTalking(), $settings);

        return [
            ...$this->mergeAfricasTalkingFromEnv($merged),
            'has_api_key' => filled($merged['api_key'] ?? null)
                || filled(env('AFRICAS_TALKING_API_KEY')),
            'api_key' => '',
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateAfricasTalking(array $data): void
    {
        $current = $this->getRaw(self::KEY_AFRICAS_TALKING) ?? PlatformSettingsDefaults::africasTalking();

        $apiKey = $data['api_key'] ?? null;
        if (filled($apiKey)) {
            $current['api_key'] = Crypt::encryptString($apiKey);
        }

        unset($data['api_key']);

        $this->put(self::KEY_AFRICAS_TALKING, array_merge($current, $data));
    }

    /**
     * @return array<string, mixed>
     */
    public function smtp(): array
    {
        $settings = $this->get(self::KEY_SMTP, PlatformSettingsDefaults::smtp());

        return $this->mergeSmtpFromEnv($settings);
    }

    /**
     * @return array<string, mixed>
     */
    public function smtpForAdmin(): array
    {
        $settings = $this->getRaw(self::KEY_SMTP) ?? [];
        $merged = array_merge(PlatformSettingsDefaults::smtp(), $settings);

        return [
            ...$this->mergeSmtpFromEnv($merged),
            'has_password' => filled($merged['password'] ?? null)
                || filled(env('MAIL_PASSWORD')),
            'password' => '',
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateSmtp(array $data): void
    {
        $current = $this->getRaw(self::KEY_SMTP) ?? PlatformSettingsDefaults::smtp();

        $password = $data['password'] ?? null;
        if (filled($password)) {
            $current['password'] = Crypt::encryptString($password);
        }

        unset($data['password']);

        $this->put(self::KEY_SMTP, array_merge($current, $data));
    }

    public function applyRuntimeConfig(): void
    {
        if (! $this->isAvailable()) {
            return;
        }

        $notifications = $this->notifications();
        if (filled($notifications['sms_driver'] ?? null)) {
            config(['sms.driver' => $notifications['sms_driver']]);
        }

        $africasTalking = $this->africasTalking();
        config(['sms.africas_talking' => [
            'username' => $africasTalking['username'] ?? '',
            'api_key' => $africasTalking['api_key'] ?? '',
            'from' => $africasTalking['from'] ?? '',
            'endpoint' => $africasTalking['endpoint'] ?? config('sms.africas_talking.endpoint'),
        ]]);

        $yo = $this->yoPayments();
        if (filled($yo['mobile_money_driver'] ?? null)) {
            config(['payments.mobile_money_driver' => $yo['mobile_money_driver']]);
        }

        config(['payments.yo' => [
            'username' => $yo['username'] ?? '',
            'password' => $yo['password'] ?? '',
            'account' => $yo['account'] ?? '',
            'api_url' => $yo['api_url'] ?? config('payments.yo.api_url'),
            'sandbox_api_url' => $yo['sandbox_api_url'] ?? config('payments.yo.sandbox_api_url'),
            'sandbox' => (bool) ($yo['sandbox'] ?? true),
            'non_blocking' => (bool) ($yo['non_blocking'] ?? true),
        ]]);

        $smtp = $this->smtp();
        $mailDriver = ($smtp['mail_driver'] ?? 'log') === 'smtp' ? 'smtp' : 'log';
        config(['mail.default' => $mailDriver]);

        if ($mailDriver === 'smtp') {
            config([
                'mail.mailers.smtp.host' => $smtp['host'] ?? '',
                'mail.mailers.smtp.port' => (int) ($smtp['port'] ?? 587),
                'mail.mailers.smtp.encryption' => filled($smtp['encryption'] ?? null)
                    ? $smtp['encryption']
                    : null,
                'mail.mailers.smtp.username' => $smtp['username'] ?? '',
                'mail.mailers.smtp.password' => $smtp['password'] ?? '',
                'mail.from.address' => $smtp['from_address'] ?: config('mail.from.address'),
                'mail.from.name' => $smtp['from_name'] ?: config('mail.from.name'),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function get(string $key, array $defaults): array
    {
        if (isset($this->memory[$key])) {
            return $this->memory[$key];
        }

        if (! $this->isAvailable()) {
            return $this->memory[$key] = $defaults;
        }

        $stored = PlatformSetting::query()->find($key);

        if ($stored === null) {
            return $this->memory[$key] = $defaults;
        }

        return $this->memory[$key] = array_replace_recursive($defaults, $stored->value);
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function getRaw(string $key): ?array
    {
        if (! $this->isAvailable()) {
            return null;
        }

        return PlatformSetting::query()->find($key)?->value;
    }

    /**
     * @param  array<string, mixed>  $value
     */
    protected function put(string $key, array $value): void
    {
        PlatformSetting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value],
        );

        unset($this->memory[$key]);
        $this->applyRuntimeConfig();
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    protected function mergeYoFromEnv(array $settings): array
    {
        return [
            'mobile_money_driver' => $settings['mobile_money_driver'] ?? env('MOBILE_MONEY_DRIVER', 'stub'),
            'username' => $settings['username'] ?: env('YO_PAYMENTS_USERNAME', ''),
            'password' => $this->decryptSecret($settings['password'] ?? null) ?: env('YO_PAYMENTS_PASSWORD', ''),
            'account' => $settings['account'] ?: env('YO_PAYMENTS_ACCOUNT', ''),
            'sandbox' => array_key_exists('sandbox', $settings)
                ? (bool) $settings['sandbox']
                : filter_var(env('YO_PAYMENTS_SANDBOX', true), FILTER_VALIDATE_BOOL),
            'non_blocking' => array_key_exists('non_blocking', $settings)
                ? (bool) $settings['non_blocking']
                : filter_var(env('YO_PAYMENTS_NON_BLOCKING', true), FILTER_VALIDATE_BOOL),
            'api_url' => $settings['api_url'] ?: env('YO_PAYMENTS_API_URL', config('payments.yo.api_url')),
            'sandbox_api_url' => $settings['sandbox_api_url'] ?: env('YO_PAYMENTS_SANDBOX_API_URL', config('payments.yo.sandbox_api_url')),
        ];
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    protected function mergeAfricasTalkingFromEnv(array $settings): array
    {
        return [
            'username' => $settings['username'] ?: env('AFRICAS_TALKING_USERNAME', ''),
            'api_key' => $this->decryptSecret($settings['api_key'] ?? null) ?: env('AFRICAS_TALKING_API_KEY', ''),
            'from' => $settings['from'] ?: env('AFRICAS_TALKING_FROM', ''),
            'endpoint' => $settings['endpoint'] ?: env('AFRICAS_TALKING_ENDPOINT', config('sms.africas_talking.endpoint')),
        ];
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    protected function mergeSmtpFromEnv(array $settings): array
    {
        return [
            'mail_driver' => $settings['mail_driver'] ?? PlatformSettingsDefaults::smtp()['mail_driver'],
            'host' => $settings['host'] ?: env('MAIL_HOST', ''),
            'port' => (int) ($settings['port'] ?: env('MAIL_PORT', 587)),
            'encryption' => array_key_exists('encryption', $settings) && $settings['encryption'] !== ''
                ? $settings['encryption']
                : (env('MAIL_ENCRYPTION') ?: ''),
            'username' => $settings['username'] ?: env('MAIL_USERNAME', ''),
            'password' => $this->decryptSecret($settings['password'] ?? null) ?: env('MAIL_PASSWORD', ''),
            'from_address' => $settings['from_address'] ?: env('MAIL_FROM_ADDRESS', config('mail.from.address')),
            'from_name' => $settings['from_name'] ?: env('MAIL_FROM_NAME', config('mail.from.name')),
        ];
    }

    protected function decryptSecret(mixed $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return $value;
        }
    }
}

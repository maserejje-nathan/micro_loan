<?php

namespace App\Services;

use App\Contracts\SmsGateway;
use App\Enums\SmsStatus;
use App\Models\Organization;
use App\Models\SmsNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class IntegrationHealthService
{
    public function __construct(protected PlatformSettingsService $settings) {}

    /**
     * @return array{driver: string, label: string, sends_real_sms: bool}
     */
    public function smsDriverSummary(): array
    {
        $this->settings->applyRuntimeConfig();

        $driver = (string) config('sms.driver');

        return match ($driver) {
            'africas_talking' => [
                'driver' => $driver,
                'label' => "Africa's Talking",
                'sends_real_sms' => true,
            ],
            default => [
                'driver' => $driver,
                'label' => 'Log only',
                'sends_real_sms' => false,
            ],
        };
    }

    /**
     * @return array{driver: string, label: string, sends_real_email: bool}
     */
    public function mailDriverSummary(): array
    {
        $this->settings->applyRuntimeConfig();

        $driver = (string) config('mail.default');

        return match ($driver) {
            'smtp' => [
                'driver' => $driver,
                'label' => 'SMTP',
                'sends_real_email' => true,
            ],
            default => [
                'driver' => $driver,
                'label' => 'Log only',
                'sends_real_email' => false,
            ],
        };
    }

    /**
     * @return array{configured: bool, driver: string, connected: bool, message: string, host?: string, from_address?: string}
     */
    public function smtpStatus(): array
    {
        $config = $this->settings->smtp();
        $driver = (string) config('mail.default');
        $configured = $driver === 'smtp'
            && filled($config['host'])
            && filled($config['from_address']);

        return [
            'driver' => $driver,
            'configured' => $configured,
            'connected' => $configured,
            'host' => $config['host'] ?? '',
            'from_address' => $config['from_address'] ?? '',
            'message' => match (true) {
                $driver !== 'smtp' => 'SMTP is not the active mail driver (using '.$driver.').',
                ! filled($config['host']) => 'SMTP host is required.',
                ! filled($config['from_address']) => 'From address is required.',
                default => 'SMTP credentials saved. Driver is active.',
            },
        ];
    }

    /**
     * @return array{ok: bool, message: string, response: array<string, mixed>|null}
     */
    public function sendTestEmail(string $email): array
    {
        $this->settings->applyRuntimeConfig();

        $driver = (string) config('mail.default');
        $status = $this->smtpStatus();

        if ($driver === 'smtp' && ! $status['configured']) {
            return [
                'ok' => false,
                'message' => 'Configure SMTP host, credentials, and from address before sending a test email.',
                'response' => null,
            ];
        }

        $subject = 'Test email from '.config('app.name');
        $body = 'This is a test email from your lending platform notification settings. If you received this, SMTP is configured correctly.';

        try {
            Mail::raw($body, function ($message) use ($email, $subject): void {
                $message->to($email)->subject($subject);
            });

            return [
                'ok' => true,
                'message' => $driver === 'log'
                    ? "Test email written to the application log (nothing was sent to {$email})."
                    : "Test email sent to {$email}.",
                'response' => [
                    'driver' => $driver,
                    'mailer' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'from' => config('mail.from.address'),
                    'to' => $email,
                    'subject' => $subject,
                ],
            ];
        } catch (\Throwable $exception) {
            return [
                'ok' => false,
                'message' => 'Could not send test email: '.$exception->getMessage(),
                'response' => [
                    'driver' => $driver,
                    'error' => $exception->getMessage(),
                ],
            ];
        }
    }

    /**
     * @return array{configured: bool, driver: string, sandbox: bool, api_url: string, connected: bool, message: string}
     */
    public function yoPaymentsStatus(): array
    {
        $config = $this->settings->yoPayments();
        $driver = (string) config('payments.mobile_money_driver');
        $configured = filled($config['username']) && filled($config['password']);
        $apiUrl = $config['sandbox']
            ? $config['sandbox_api_url']
            : $config['api_url'];

        return [
            'driver' => $driver,
            'configured' => $configured,
            'sandbox' => (bool) $config['sandbox'],
            'api_url' => $apiUrl,
            'connected' => $driver === 'yo' && $configured,
            'message' => match (true) {
                $driver !== 'yo' => 'Yo! Payments driver is not active (using '.$driver.').',
                ! $configured => 'Username and password are required.',
                default => 'Credentials saved. Driver is active.',
            },
        ];
    }

    /**
     * @return array{ok: bool, message: string}
     */
    public function testYoPayments(): array
    {
        $status = $this->yoPaymentsStatus();

        if (! $status['configured']) {
            return ['ok' => false, 'message' => 'Configure Yo! Payments username and password first.'];
        }

        $config = $this->settings->yoPayments();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'
            .'<AutoCreate><Request><APIUsername>'.e($config['username']).'</APIUsername>'
            .'<APIPassword>'.e($config['password']).'</APIPassword>'
            .'<Method>acgetbalance</Method></Request></AutoCreate>';

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Content-Type' => 'text/xml',
                    'Content-transfer-encoding' => 'text',
                ])
                ->withBody($xml, 'text/xml')
                ->post($status['api_url']);

            if ($response->successful() && str_contains($response->body(), '<Status>OK</Status>')) {
                return ['ok' => true, 'message' => 'Connected to Yo! Payments API successfully.'];
            }

            return [
                'ok' => false,
                'message' => 'Yo! Payments API responded but the balance check did not succeed.',
            ];
        } catch (\Throwable $exception) {
            return [
                'ok' => false,
                'message' => 'Could not reach Yo! Payments: '.$exception->getMessage(),
            ];
        }
    }

    /**
     * @return array{configured: bool, driver: string, connected: bool, message: string}
     */
    public function africasTalkingStatus(): array
    {
        $config = $this->settings->africasTalking();
        $driver = (string) config('sms.driver');
        $configured = filled($config['username']) && filled($config['api_key']);

        return [
            'driver' => $driver,
            'configured' => $configured,
            'connected' => $driver === 'africas_talking' && $configured,
            'message' => match (true) {
                $driver !== 'africas_talking' => 'Africa\'s Talking is not the active SMS driver (using '.$driver.').',
                ! $configured => 'Username and API key are required.',
                default => 'Credentials saved. Driver is active.',
            },
        ];
    }

    /**
     * @return array{ok: bool, message: string, response: array<string, mixed>|null}
     */
    public function testAfricasTalking(): array
    {
        $status = $this->africasTalkingStatus();

        if (! $status['configured']) {
            return [
                'ok' => false,
                'message' => 'Configure Africa\'s Talking username and API key first.',
                'response' => null,
            ];
        }

        $config = $this->settings->africasTalking();

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'apiKey' => $config['api_key'],
                    'Accept' => 'application/json',
                ])
                ->get('https://api.africastalking.com/version1/user', [
                    'username' => $config['username'],
                ]);

            $body = $this->httpResponsePayload($response);

            if ($response->successful()) {
                return [
                    'ok' => true,
                    'message' => 'Connected to Africa\'s Talking API successfully.',
                    'response' => $body,
                ];
            }

            return [
                'ok' => false,
                'message' => 'Africa\'s Talking API returned HTTP '.$response->status().'.',
                'response' => $body,
            ];
        } catch (\Throwable $exception) {
            return [
                'ok' => false,
                'message' => 'Could not reach Africa\'s Talking: '.$exception->getMessage(),
                'response' => [
                    'error' => $exception->getMessage(),
                ],
            ];
        }
    }

    /**
     * @return array{ok: bool, message: string, response: array<string, mixed>|null}
     */
    public function sendTestSms(string $phone, ?string $message = null): array
    {
        $this->settings->applyRuntimeConfig();

        $driver = (string) config('sms.driver');
        $organizationId = Organization::query()->value('id');

        if ($organizationId === null) {
            return [
                'ok' => false,
                'message' => 'Create at least one organization before sending a test SMS.',
                'response' => null,
            ];
        }

        if ($driver === 'africas_talking') {
            $status = $this->africasTalkingStatus();

            if (! $status['configured']) {
                return [
                    'ok' => false,
                    'message' => 'Configure Africa\'s Talking username and API key, and set the SMS driver to Africa\'s Talking.',
                    'response' => null,
                ];
            }
        }

        $body = $message ?: 'Test SMS from '.config('app.name').' — your notification setup is working.';

        app()->forgetInstance(SmsGateway::class);

        $notification = SmsNotification::query()->create([
            'organization_id' => $organizationId,
            'recipient_phone' => $phone,
            'message' => $body,
            'type' => 'admin_test',
            'status' => SmsStatus::Pending,
        ]);

        $sent = app(SmsGateway::class)->send($notification);
        $notification->refresh();

        $providerResponse = $this->providerResponsePayload($notification->provider_response);

        if ($driver === 'log') {
            return [
                'ok' => true,
                'message' => 'Test SMS written to the application log (no message was sent to the phone). Check storage/logs for the entry.',
                'response' => $providerResponse,
            ];
        }

        if ($sent && $notification->status === SmsStatus::Sent) {
            return [
                'ok' => true,
                'message' => "Test SMS sent to {$phone} via Africa's Talking.",
                'response' => $providerResponse,
            ];
        }

        $detail = $this->formatProviderError($notification->provider_response);

        return [
            'ok' => false,
            'message' => $detail !== ''
                ? "SMS delivery failed: {$detail}"
                : 'SMS delivery failed. Check Africa\'s Talking credentials and sender ID.',
            'response' => $providerResponse,
        ];
    }

    /**
     * @return array{http_status: int, body: array<string, mixed>|string|null}
     */
    protected function httpResponsePayload(\Illuminate\Http\Client\Response $response): array
    {
        $json = $response->json();

        return [
            'http_status' => $response->status(),
            'body' => is_array($json) ? $json : ($response->body() !== '' ? $response->body() : null),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $response
     * @return array<string, mixed>|null
     */
    protected function providerResponsePayload(?array $response): ?array
    {
        if ($response === null || $response === []) {
            return null;
        }

        return $response;
    }

    /**
     * @param  array<string, mixed>|null  $response
     */
    protected function formatProviderError(?array $response): string
    {
        if ($response === null || $response === []) {
            return '';
        }

        if (isset($response['error']) && is_string($response['error'])) {
            return $response['error'];
        }

        $recipients = $response['SMSMessageData']['Recipients'] ?? null;

        if (is_array($recipients)) {
            foreach ($recipients as $recipient) {
                if (is_array($recipient) && filled($recipient['statusMessage'] ?? null)) {
                    return (string) $recipient['statusMessage'];
                }
            }
        }

        return json_encode($response, JSON_UNESCAPED_UNICODE) ?: '';
    }
}

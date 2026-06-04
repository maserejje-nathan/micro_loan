<?php

namespace App\Services\Sms;

use App\Contracts\SmsGateway;
use App\Enums\SmsStatus;
use App\Models\SmsNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AfricasTalkingSmsGateway implements SmsGateway
{
    public function send(SmsNotification $notification): bool
    {
        $config = config('sms.africas_talking');

        if (empty($config['username']) || empty($config['api_key'])) {
            Log::warning('Africa\'s Talking SMS is not configured.');

            $notification->update([
                'status' => SmsStatus::Failed,
                'provider_response' => ['error' => 'missing_configuration'],
            ]);

            return false;
        }

        $response = Http::withHeaders([
            'apiKey' => $config['api_key'],
            'Accept' => 'application/json',
        ])->asForm()->post($config['endpoint'], array_filter([
            'username' => $config['username'],
            'to' => $notification->recipient_phone,
            'message' => $notification->message,
            'from' => $config['from'] ?? null,
        ]));

        $body = $response->json() ?? ['raw' => $response->body()];

        if ($response->successful()) {
            $notification->update([
                'status' => SmsStatus::Sent,
                'sent_at' => now(),
                'provider_response' => $body,
            ]);

            return true;
        }

        $notification->update([
            'status' => SmsStatus::Failed,
            'provider_response' => $body,
        ]);

        return false;
    }
}

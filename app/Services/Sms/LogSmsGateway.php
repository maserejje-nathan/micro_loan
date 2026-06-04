<?php

namespace App\Services\Sms;

use App\Contracts\SmsGateway;
use App\Enums\SmsStatus;
use App\Models\SmsNotification;
use Illuminate\Support\Facades\Log;

class LogSmsGateway implements SmsGateway
{
    public function send(SmsNotification $notification): bool
    {
        Log::info('SMS sent', [
            'to' => $notification->recipient_phone,
            'message' => $notification->message,
            'type' => $notification->type,
        ]);

        $notification->update([
            'status' => SmsStatus::Sent,
            'sent_at' => now(),
            'provider_response' => ['driver' => 'log'],
        ]);

        return true;
    }
}

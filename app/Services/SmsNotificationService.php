<?php

namespace App\Services;

use App\Contracts\SmsGateway;
use App\Enums\SmsStatus;
use App\Models\SmsNotification;
use App\Support\OrganizationContext;
use Illuminate\Database\Eloquent\Model;

class SmsNotificationService
{
    public function __construct(protected SmsGateway $gateway) {}

    public function send(
        string $phone,
        string $message,
        string $type,
        ?Model $notifiable = null,
    ): ?SmsNotification {
        $settings = app(PlatformSettingsService::class);

        if ($settings->isAvailable() && ! $settings->isNotificationTypeEnabled($type)) {
            return null;
        }

        $notification = SmsNotification::query()->create([
            'organization_id' => OrganizationContext::id(),
            'recipient_phone' => $phone,
            'message' => $message,
            'type' => $type,
            'status' => SmsStatus::Pending,
            'notifiable_type' => $notifiable?->getMorphClass(),
            'notifiable_id' => $notifiable?->getKey(),
        ]);

        $this->gateway->send($notification);

        return $notification->fresh();
    }
}

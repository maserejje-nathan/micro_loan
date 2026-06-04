<?php

namespace App\Support;

use App\Enums\NotificationChannel;
use App\Models\Customer;
use Illuminate\Validation\Rule;

class CustomerNotificationChannels
{
    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(NotificationChannel::cases())
            ->map(fn (NotificationChannel $channel) => [
                'value' => $channel->value,
                'label' => $channel->label(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function validationRules(): array
    {
        return [
            'payment_reminder_channels' => ['required', 'array', 'min:1'],
            'payment_reminder_channels.*' => [
                'string',
                Rule::in(array_column(NotificationChannel::cases(), 'value')),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $input
     * @return list<string>
     */
    public static function fromRequestInput(?array $input): array
    {
        if ($input === null) {
            return [NotificationChannel::Sms->value];
        }

        $channels = [];

        foreach (NotificationChannel::cases() as $channel) {
            if (filter_var($input[$channel->value] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                $channels[] = $channel->value;
            }
        }

        return self::normalize($channels);
    }

    /**
     * @param  list<string>|null  $channels
     * @return list<string>
     */
    public static function normalize(?array $channels): array
    {
        if ($channels === null) {
            return [NotificationChannel::Sms->value];
        }

        $valid = array_column(NotificationChannel::cases(), 'value');

        return array_values(array_unique(array_filter(
            $channels,
            fn (mixed $channel) => is_string($channel) && in_array($channel, $valid, true),
        )));
    }

    public static function wants(Customer $customer, NotificationChannel $channel): bool
    {
        return in_array($channel->value, $customer->paymentReminderChannels(), true);
    }

    public static function canUse(Customer $customer, NotificationChannel $channel): bool
    {
        if (! self::wants($customer, $channel)) {
            return false;
        }

        return match ($channel) {
            NotificationChannel::Sms => filled($customer->phone),
            NotificationChannel::Email => filled($customer->email),
        };
    }
}

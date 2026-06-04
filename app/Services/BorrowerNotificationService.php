<?php

namespace App\Services;

use App\Enums\NotificationChannel;
use App\Models\Customer;
use App\Models\SmsNotification;
use App\Support\CustomerNotificationChannels;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;

class BorrowerNotificationService
{
    public function __construct(protected SmsNotificationService $sms) {}

    /**
     * @return array{sms: ?SmsNotification, email: bool, skipped: list<string>}
     */
    public function sendPaymentReminder(
        Customer $customer,
        string $message,
        ?Model $notifiable = null,
    ): array {
        $settings = app(PlatformSettingsService::class);

        if ($settings->isAvailable() && ! $settings->isNotificationTypeEnabled('overdue_reminder')) {
            return [
                'sms' => null,
                'email' => false,
                'skipped' => ['sms', 'email'],
            ];
        }

        $smsNotification = null;
        $emailSent = false;
        $skipped = [];

        if (CustomerNotificationChannels::canUse($customer, NotificationChannel::Sms)) {
            $smsNotification = $this->sms->send(
                $customer->phone,
                $message,
                'overdue_reminder',
                $notifiable,
            );
        } elseif (CustomerNotificationChannels::wants($customer, NotificationChannel::Sms)) {
            $skipped[] = NotificationChannel::Sms->value;
        }

        if (CustomerNotificationChannels::canUse($customer, NotificationChannel::Email)) {
            try {
                Mail::raw($message, function ($mail) use ($customer): void {
                    $mail->to($customer->email)
                        ->subject('Payment reminder — '.config('app.name'));
                });
                $emailSent = true;
            } catch (\Throwable) {
                $skipped[] = NotificationChannel::Email->value;
            }
        } elseif (CustomerNotificationChannels::wants($customer, NotificationChannel::Email)) {
            $skipped[] = NotificationChannel::Email->value;
        }

        return [
            'sms' => $smsNotification,
            'email' => $emailSent,
            'skipped' => $skipped,
        ];
    }
}

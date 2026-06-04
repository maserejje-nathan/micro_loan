<?php

namespace App\Http\Requests\Concerns;

use App\Support\CustomerNotificationChannels;

trait ValidatesPaymentReminderChannels
{
    protected function preparePaymentReminderChannelsForValidation(): void
    {
        $this->merge([
            'payment_reminder_channels' => CustomerNotificationChannels::fromRequestInput(
                $this->input('payment_reminder_channels'),
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function paymentReminderChannelRules(): array
    {
        return CustomerNotificationChannels::validationRules();
    }
}

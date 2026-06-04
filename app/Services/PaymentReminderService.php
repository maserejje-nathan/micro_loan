<?php

namespace App\Services;

use App\Enums\NotificationChannel;
use App\Enums\ScheduleInstallmentStatus;
use App\Models\LoanSchedule;
use App\Models\Organization;
use App\Support\CustomerNotificationChannels;
use App\Support\OrganizationContext;

class PaymentReminderService
{
    public function __construct(protected BorrowerNotificationService $notifications) {}

    public function sendForSchedule(
        LoanSchedule $schedule,
        bool $markNotified = false,
    ): PaymentReminderSendResult {
        $schedule->loadMissing(['loan.customer', 'loan.organization']);

        $loan = $schedule->loan;
        $customer = $loan->customer;
        $organization = $loan->organization ?? OrganizationContext::get();

        if (! in_array($schedule->status, [
            ScheduleInstallmentStatus::Pending,
            ScheduleInstallmentStatus::Partial,
            ScheduleInstallmentStatus::Overdue,
        ], true)) {
            return new PaymentReminderSendResult(
                ok: false,
                message: 'Reminders can only be sent for unpaid installments.',
            );
        }

        if ($schedule->remainingAmount() <= 0) {
            return new PaymentReminderSendResult(
                ok: false,
                message: 'This installment is already fully paid.',
            );
        }

        if ($customer->paymentReminderChannels() === []) {
            return new PaymentReminderSendResult(
                ok: false,
                message: 'The customer has not selected any payment reminder channels.',
            );
        }

        $message = $this->messageForSchedule($schedule, $organization);

        $result = $this->notifications->sendPaymentReminder(
            $customer,
            $message,
            $schedule,
        );

        $sent = $this->describeChannelsSent($result);
        $skipped = $result['skipped'];

        if ($sent === []) {
            $reasons = [];

            if (CustomerNotificationChannels::wants($customer, NotificationChannel::Sms)
                && ! CustomerNotificationChannels::canUse($customer, NotificationChannel::Sms)) {
                $reasons[] = 'SMS is enabled but no phone number is on file';
            }

            if (CustomerNotificationChannels::wants($customer, NotificationChannel::Email)
                && ! CustomerNotificationChannels::canUse($customer, NotificationChannel::Email)) {
                $reasons[] = 'email is enabled but no email address is on file';
            }

            $detail = $reasons !== []
                ? implode('; ', $reasons).'.'
                : 'Check platform notification settings and channel configuration.';

            return new PaymentReminderSendResult(
                ok: false,
                message: 'No reminder was delivered. '.$detail,
                channelsSkipped: $skipped,
            );
        }

        if ($markNotified) {
            $schedule->update(['overdue_notified_at' => now()]);
        }

        return new PaymentReminderSendResult(
            ok: true,
            message: 'Payment reminder sent via '.implode(' and ', $sent).'.',
            channelsSent: $sent,
            channelsSkipped: $skipped,
        );
    }

    public function messageForSchedule(LoanSchedule $schedule, ?Organization $organization = null): string
    {
        $loan = $schedule->loan;
        $organization ??= $loan->organization ?? OrganizationContext::get();
        $currency = $organization?->currency ?? 'UGX';
        $remaining = $schedule->remainingAmount();

        return "Reminder: Loan {$loan->reference_number} installment #{$schedule->installment_number} "
            ."of {$remaining} {$currency} was due on {$schedule->due_date->format('d M Y')}. "
            .'Please make payment.';
    }

    /**
     * @param  array{sms: ?\App\Models\SmsNotification, email: bool, skipped: list<string>}  $result
     * @return list<string>
     */
    protected function describeChannelsSent(array $result): array
    {
        $sent = [];

        if ($result['sms'] !== null) {
            $sent[] = NotificationChannel::Sms->label();
        }

        if ($result['email']) {
            $sent[] = NotificationChannel::Email->label();
        }

        return $sent;
    }
}

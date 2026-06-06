<?php

namespace App\Services;

use App\Contracts\MobileMoneyGateway;
use App\Enums\LoanStatus;
use App\Enums\MobileMoneyStatus;
use App\Enums\PaymentChannel;
use App\Enums\ScheduleInstallmentStatus;
use App\Models\Loan;
use App\Models\MobileMoneyTransaction;
use App\Models\Repayment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RepaymentService
{
    public function __construct(
        protected ReferenceNumberGenerator $referenceNumberGenerator,
        protected MobileMoneyGateway $mobileMoneyGateway,
        protected AuditLogger $auditLogger,
        protected SmsNotificationService $sms,
        protected InAppNotificationService $inApp,
    ) {}

    /**
     * @param  array{amount: int, channel: string, phone?: string|null, provider?: string|null, loan_schedule_id?: int|null}  $data
     */
    public function record(Loan $loan, User $user, array $data): Repayment
    {
        if ($loan->status !== LoanStatus::Active) {
            throw new InvalidArgumentException('Repayments can only be recorded on active loans.');
        }

        return DB::transaction(function () use ($loan, $user, $data) {
            $amount = (int) $data['amount'];
            $channel = PaymentChannel::from($data['channel']);

            if ($amount <= 0 || $amount > $loan->outstanding_balance) {
                throw new InvalidArgumentException('Invalid repayment amount.');
            }

            $repayment = Repayment::query()->create([
                'organization_id' => $loan->organization_id,
                'loan_id' => $loan->id,
                'loan_schedule_id' => $data['loan_schedule_id'] ?? null,
                'reference_number' => $this->referenceNumberGenerator->generate(
                    new Repayment(['organization_id' => $loan->organization_id]),
                    'RP',
                ),
                'amount' => $amount,
                'channel' => $channel,
                'received_by' => $user->id,
                'paid_at' => now(),
            ]);

            if ($channel === PaymentChannel::MobileMoney) {
                $transaction = MobileMoneyTransaction::query()->create([
                    'organization_id' => $loan->organization_id,
                    'type' => 'repayment',
                    'payable_type' => $repayment->getMorphClass(),
                    'payable_id' => $repayment->id,
                    'provider' => $data['provider'] ?? 'mtn',
                    'phone' => $data['phone'] ?? $loan->customer->phone,
                    'amount' => $amount,
                    'status' => MobileMoneyStatus::Pending,
                ]);

                $transaction = $this->mobileMoneyGateway->collect($transaction);

                if ($transaction->status === MobileMoneyStatus::Failed) {
                    throw new InvalidArgumentException(
                        'Mobile money collection failed. Check Yo! Payments credentials in platform settings and try again.',
                    );
                }

                $repayment->update([
                    'mobile_money_reference' => $transaction->external_id,
                ]);
            }

            $this->allocateToSchedules($loan, $amount, $data['loan_schedule_id'] ?? null);

            $newBalance = $loan->outstanding_balance - $amount;
            $loan->update([
                'outstanding_balance' => $newBalance,
                'status' => $newBalance <= 0 ? LoanStatus::Closed : LoanStatus::Active,
                'closed_at' => $newBalance <= 0 ? now() : null,
            ]);

            $this->auditLogger->log('repayment.recorded', $repayment);

            $this->sms->send(
                $loan->customer->phone,
                "Payment of {$amount} received for loan {$loan->reference_number}. Balance: {$newBalance}.",
                'repayment_received',
                $repayment,
            );

            $loan->load('customer', 'organization');

            $this->inApp->notifyOrganization(
                $loan->organization,
                'repayments.view',
                $this->inApp->payload(
                    'repayment.recorded',
                    'Repayment recorded',
                    "{$repayment->reference_number} of {$amount} received for loan {$loan->reference_number}.",
                    route('loans.show', $loan),
                    $loan->organization_id,
                ),
                $user,
            );

            return $repayment->fresh();
        });
    }

    protected function allocateToSchedules(Loan $loan, int $amount, ?int $scheduleId): void
    {
        $remaining = $amount;

        $schedules = $scheduleId
            ? $loan->schedules()->where('id', $scheduleId)->get()
            : $loan->schedules()
                ->whereIn('status', [
                    ScheduleInstallmentStatus::Pending,
                    ScheduleInstallmentStatus::Partial,
                    ScheduleInstallmentStatus::Overdue,
                ])
                ->orderBy('installment_number')
                ->get();

        foreach ($schedules as $schedule) {
            if ($remaining <= 0) {
                break;
            }

            $due = $schedule->remainingAmount();
            $applied = min($remaining, $due);
            $newPaid = $schedule->paid_amount + $applied;

            $status = match (true) {
                $newPaid >= $schedule->total_amount => ScheduleInstallmentStatus::Paid,
                $newPaid > 0 => ScheduleInstallmentStatus::Partial,
                default => ScheduleInstallmentStatus::Pending,
            };

            $schedule->update([
                'paid_amount' => $newPaid,
                'status' => $status,
            ]);

            $remaining -= $applied;
        }
    }
}

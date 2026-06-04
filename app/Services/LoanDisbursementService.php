<?php

namespace App\Services;

use App\Contracts\MobileMoneyGateway;
use App\Enums\DisbursementStatus;
use App\Enums\LoanStatus;
use App\Enums\MobileMoneyStatus;
use App\Enums\PaymentChannel;
use App\Models\Disbursement;
use App\Models\Loan;
use App\Models\MobileMoneyTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LoanDisbursementService
{
    public function __construct(
        protected LoanScheduleGenerator $scheduleGenerator,
        protected MobileMoneyGateway $mobileMoneyGateway,
        protected AuditLogger $auditLogger,
        protected SmsNotificationService $sms,
        protected InAppNotificationService $inApp,
    ) {}

    /**
     * @param  array{channel: string, phone?: string|null, provider?: string|null}  $data
     */
    public function disburse(Loan $loan, User $user, array $data): Disbursement
    {
        if ($loan->status !== LoanStatus::PendingDisbursement) {
            throw new InvalidArgumentException('Loan is not pending disbursement.');
        }

        return DB::transaction(function () use ($loan, $user, $data) {
            $channel = PaymentChannel::from($data['channel']);

            $disbursement = Disbursement::query()->create([
                'organization_id' => $loan->organization_id,
                'loan_id' => $loan->id,
                'amount' => $loan->principal,
                'channel' => $channel,
                'status' => DisbursementStatus::Pending,
                'disbursed_by' => $user->id,
            ]);

            if ($channel === PaymentChannel::MobileMoney) {
                $transaction = MobileMoneyTransaction::query()->create([
                    'organization_id' => $loan->organization_id,
                    'type' => 'disbursement',
                    'payable_type' => $disbursement->getMorphClass(),
                    'payable_id' => $disbursement->id,
                    'provider' => $data['provider'] ?? 'mtn',
                    'phone' => $data['phone'] ?? $loan->customer->phone,
                    'amount' => $loan->principal,
                    'status' => MobileMoneyStatus::Pending,
                ]);

                $transaction = $this->mobileMoneyGateway->disburse($transaction);

                if ($transaction->status === MobileMoneyStatus::Failed) {
                    $disbursement->update([
                        'status' => DisbursementStatus::Failed,
                    ]);

                    throw new InvalidArgumentException(
                        'Mobile money disbursement failed. Check Yo! Payments credentials in platform settings and try again.',
                    );
                }

                $disbursement->update([
                    'mobile_money_reference' => $transaction->external_id,
                    'status' => DisbursementStatus::Completed,
                    'disbursed_at' => now(),
                ]);
            } else {
                $disbursement->update([
                    'status' => DisbursementStatus::Completed,
                    'disbursed_at' => now(),
                ]);
            }

            $loan->update([
                'status' => LoanStatus::Active,
                'disbursed_at' => now(),
            ]);

            $this->scheduleGenerator->generate($loan);

            $this->auditLogger->log('loan.disbursed', $loan);

            $this->sms->send(
                $loan->customer->phone,
                "Loan {$loan->reference_number} of {$loan->principal} has been disbursed to you.",
                'loan_disbursed',
                $loan,
            );

            $loan->load('customer', 'organization');

            $this->inApp->notifyOrganization(
                $loan->organization,
                'loans.view',
                $this->inApp->payload(
                    'loan.disbursed',
                    'Loan disbursed',
                    "Loan {$loan->reference_number} for {$loan->customer->fullName()} is now active.",
                    route('loans.show', $loan),
                    $loan->organization_id,
                ),
                $user,
            );

            return $disbursement->fresh();
        });
    }
}

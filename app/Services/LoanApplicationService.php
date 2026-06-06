<?php

namespace App\Services;

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\User;
use App\Support\LoanProductLimitValidator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LoanApplicationService
{
    public function __construct(
        protected ReferenceNumberGenerator $referenceNumberGenerator,
        protected LoanCalculator $loanCalculator,
        protected AuditLogger $auditLogger,
        protected SmsNotificationService $sms,
        protected InAppNotificationService $inApp,
    ) {}

    public function submit(LoanApplication $application, ?User $actor = null): LoanApplication
    {
        if ($application->status !== LoanApplicationStatus::Draft) {
            throw new InvalidArgumentException('Only draft applications can be submitted.');
        }

        $application->update(['status' => LoanApplicationStatus::Submitted]);

        $this->auditLogger->log('loan_application.submitted', $application);

        $application->load(['customer', 'organization']);

        $this->inApp->notifyOrganization(
            $application->organization,
            'loan_applications.approve',
            $this->inApp->payload(
                'loan_application.submitted',
                'Loan application submitted',
                "{$application->reference_number} for {$application->customer->fullName()} is ready for review.",
                route('loan-applications.show', $application),
                $application->organization_id,
            ),
            $actor,
        );

        return $application->fresh();
    }

    public function approve(
        LoanApplication $application,
        User $reviewer,
        ?int $approvedAmount = null,
        ?int $termDays = null,
    ): Loan {
        if (! in_array($application->status, [LoanApplicationStatus::Submitted, LoanApplicationStatus::UnderReview], true)) {
            throw new InvalidArgumentException('Application cannot be approved in its current status.');
        }

        return DB::transaction(function () use ($application, $reviewer, $approvedAmount, $termDays) {
            $amount = $approvedAmount ?? $application->requested_amount;
            $term = $termDays ?? $application->term_days;
            $product = $application->loanProduct;

            LoanProductLimitValidator::assertValid($product, $amount, $term);

            $calculation = $this->loanCalculator->calculate($amount, $product, $term);

            $application->update([
                'status' => LoanApplicationStatus::Approved,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'approved_amount' => $amount,
                'term_days' => $term,
            ]);

            $loan = Loan::query()->create([
                'organization_id' => $application->organization_id,
                'loan_application_id' => $application->id,
                'customer_id' => $application->customer_id,
                'loan_product_id' => $application->loan_product_id,
                'reference_number' => $this->referenceNumberGenerator->generate(
                    new Loan(['organization_id' => $application->organization_id]),
                    'LN',
                ),
                'principal' => $amount,
                'interest_rate' => $product->interest_rate,
                'interest_type' => $product->interest_type,
                'term_days' => $term,
                'repayment_frequency' => $product->repayment_frequency,
                'total_interest' => $calculation['total_interest'],
                'total_repayable' => $calculation['total_repayable'],
                'outstanding_balance' => $calculation['total_repayable'],
                'status' => LoanStatus::PendingDisbursement,
            ]);

            $this->auditLogger->log('loan_application.approved', $application, null, [
                'loan_id' => $loan->id,
            ]);

            $customer = $application->customer;
            $this->sms->send(
                $customer->phone,
                "Your loan application {$application->reference_number} has been approved. Loan ref: {$loan->reference_number}.",
                'loan_approved',
                $loan,
            );

            if ($application->created_by && $application->created_by !== $reviewer->id) {
                $creator = User::query()->find($application->created_by);

                if ($creator) {
                    $this->inApp->notify(
                        $creator,
                        $this->inApp->payload(
                            'loan_application.approved',
                            'Application approved',
                            "{$application->reference_number} was approved. Loan {$loan->reference_number} is pending disbursement.",
                            route('loans.show', $loan),
                            $application->organization_id,
                        ),
                    );
                }
            }

            return $loan;
        });
    }

    public function reject(LoanApplication $application, User $reviewer, string $reason): LoanApplication
    {
        $application->update([
            'status' => LoanApplicationStatus::Rejected,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $this->auditLogger->log('loan_application.rejected', $application);

        $this->sms->send(
            $application->customer->phone,
            "Your loan application {$application->reference_number} was not approved.",
            'loan_rejected',
            $application,
        );

        if ($application->created_by && $application->created_by !== $reviewer->id) {
            $creator = User::query()->find($application->created_by);

            if ($creator) {
                $this->inApp->notify(
                    $creator,
                    $this->inApp->payload(
                        'loan_application.rejected',
                        'Application rejected',
                        "{$application->reference_number} was not approved.",
                        route('loan-applications.show', $application),
                        $application->organization_id,
                    ),
                );
            }
        }

        return $application->fresh();
    }

    /**
     * @param  list<array{type: string, description: string, estimated_value: int, identifier?: string|null}>  $collaterals
     */
    public function storeCollaterals(LoanApplication $application, array $collaterals): void
    {
        foreach ($collaterals as $collateral) {
            $application->collaterals()->create($collateral);
        }
    }
}

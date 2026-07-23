<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Loan
 */
class LoanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalRepaid = max(0, $this->total_repayable - $this->outstanding_balance);

        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'loan_application_id' => $this->loan_application_id,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->when(
                $this->relationLoaded('customer') && $this->customer !== null,
                fn () => $this->customer->fullName(),
            ),
            'customer' => $this->when(
                $this->relationLoaded('customer') && $this->customer !== null,
                fn () => [
                    'id' => $this->customer->id,
                    'name' => $this->customer->fullName(),
                    'phone' => $this->customer->phone,
                    'email' => $this->customer->email,
                    'payment_reminder_channels' => $this->customer->paymentReminderChannels(),
                ],
            ),
            'loan_product_id' => $this->loan_product_id,
            'product_name' => $this->when(
                $this->relationLoaded('loanProduct') && $this->loanProduct !== null,
                fn () => $this->loanProduct->name,
            ),
            'product_code' => $this->when(
                $this->relationLoaded('loanProduct') && $this->loanProduct !== null,
                fn () => $this->loanProduct->code,
            ),
            'product' => $this->when(
                $this->relationLoaded('loanProduct') && $this->loanProduct !== null,
                fn () => [
                    'id' => $this->loanProduct->id,
                    'name' => $this->loanProduct->name,
                    'code' => $this->loanProduct->code,
                ],
            ),
            'principal' => $this->principal,
            'interest_rate' => (float) $this->interest_rate,
            'interest_type' => $this->interest_type->value,
            'term_days' => $this->term_days,
            'repayment_frequency' => $this->repayment_frequency->value,
            'total_interest' => $this->total_interest,
            'total_repayable' => $this->total_repayable,
            'outstanding_balance' => $this->outstanding_balance,
            'total_repaid' => $totalRepaid,
            'repayment_progress' => $this->total_repayable > 0
                ? (int) round(($totalRepaid / $this->total_repayable) * 100)
                : 0,
            'status' => $this->status->value,
            'disbursed_at' => $this->disbursed_at?->toDateString(),
            'closed_at' => $this->closed_at?->toDateString(),
            'disbursement' => $this->when(
                $this->relationLoaded('disbursement') && $this->disbursement !== null,
                fn () => [
                    'amount' => $this->disbursement->amount,
                    'channel' => $this->disbursement->channel->value,
                    'status' => $this->disbursement->status->value,
                    'mobile_money_reference' => $this->disbursement->mobile_money_reference,
                    'disbursed_at' => $this->disbursement->disbursed_at?->toDateTimeString(),
                ],
            ),
        ];
    }
}

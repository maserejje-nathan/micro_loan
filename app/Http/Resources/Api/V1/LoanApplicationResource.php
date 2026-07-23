<?php

namespace App\Http\Resources\Api\V1;

use App\Models\LoanApplication;
use App\Support\LoanApplicationCollateralData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LoanApplication
 */
class LoanApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
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
                    'min_amount' => $this->loanProduct->min_amount,
                    'max_amount' => $this->loanProduct->max_amount,
                    'term_min_days' => $this->loanProduct->term_min_days,
                    'term_max_days' => $this->loanProduct->term_max_days,
                    'interest_rate' => (float) $this->loanProduct->interest_rate,
                    'interest_type' => $this->loanProduct->interest_type->value,
                    'repayment_frequency' => $this->loanProduct->repayment_frequency->value,
                    'processing_fee' => (int) $this->loanProduct->processing_fee,
                ],
            ),
            'requested_amount' => $this->requested_amount,
            'approved_amount' => $this->approved_amount,
            'term_days' => $this->term_days,
            'purpose' => $this->purpose,
            'status' => $this->status->value,
            'rejection_reason' => $this->rejection_reason,
            'reviewed_at' => $this->reviewed_at?->toDateTimeString(),
            'reviewer_name' => $this->when(
                $this->relationLoaded('reviewer'),
                fn () => $this->reviewer?->name,
            ),
            'loan' => $this->when(
                $this->relationLoaded('loan') && $this->loan !== null,
                fn () => [
                    'id' => $this->loan->id,
                    'reference_number' => $this->loan->reference_number,
                    'status' => $this->loan->status->value,
                    'principal' => $this->loan->principal,
                    'outstanding_balance' => $this->loan->outstanding_balance,
                ],
            ),
            'collaterals' => $this->when(
                $this->relationLoaded('collaterals'),
                fn () => LoanApplicationCollateralData::serializeCollection($this->collaterals),
            ),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}

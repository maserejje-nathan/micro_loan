<?php

namespace App\Http\Resources\Api\V1;

use App\Models\LoanProduct;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LoanProduct
 */
class LoanProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'min_amount' => $this->min_amount,
            'max_amount' => $this->max_amount,
            'interest_rate' => (string) $this->interest_rate,
            'interest_type' => $this->interest_type->value,
            'term_min_days' => $this->term_min_days,
            'term_max_days' => $this->term_max_days,
            'repayment_frequency' => $this->repayment_frequency->value,
            'grace_period_days' => $this->grace_period_days,
            'processing_fee' => $this->processing_fee,
            'description' => $this->description,
            'is_active' => $this->is_active,
        ];
    }
}

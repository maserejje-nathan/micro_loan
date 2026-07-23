<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Repayment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Repayment
 */
class RepaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'loan_id' => $this->loan_id,
            'loan_reference' => $this->when(
                $this->relationLoaded('loan') && $this->loan !== null,
                fn () => $this->loan->reference_number,
            ),
            'customer_id' => $this->when(
                $this->relationLoaded('loan') && $this->loan?->relationLoaded('customer'),
                fn () => $this->loan->customer_id,
            ),
            'customer_name' => $this->when(
                $this->relationLoaded('loan')
                    && $this->loan?->relationLoaded('customer')
                    && $this->loan->customer !== null,
                fn () => $this->loan->customer->fullName(),
            ),
            'amount' => $this->amount,
            'channel' => $this->channel->value,
            'mobile_money_reference' => $this->mobile_money_reference,
            'paid_at' => $this->paid_at?->toDateTimeString(),
        ];
    }
}

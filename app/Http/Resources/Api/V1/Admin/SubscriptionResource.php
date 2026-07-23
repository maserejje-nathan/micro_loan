<?php

namespace App\Http\Resources\Api\V1\Admin;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Subscription
 */
class SubscriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'organization' => $this->when(
                $this->relationLoaded('organization') && $this->organization !== null,
                fn () => [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                ],
            ),
            'plan' => $this->when(
                $this->relationLoaded('plan') && $this->plan !== null,
                fn () => [
                    'id' => $this->plan->id,
                    'name' => $this->plan->name,
                    'price' => $this->plan->price,
                    'currency' => $this->plan->currency,
                    'billing_interval' => $this->plan->billing_interval->value,
                ],
            ),
            'trial_ends_at' => $this->trial_ends_at?->toDateTimeString(),
            'current_period_start' => $this->current_period_start?->toDateTimeString(),
            'current_period_end' => $this->current_period_end?->toDateTimeString(),
            'canceled_at' => $this->canceled_at?->toDateTimeString(),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}

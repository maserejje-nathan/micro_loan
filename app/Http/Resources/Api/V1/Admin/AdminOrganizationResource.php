<?php

namespace App\Http\Resources\Api\V1\Admin;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Organization
 */
class AdminOrganizationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $subscription = $this->relationLoaded('subscriptions')
            ? $this->subscriptions->first()
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'subdomain' => $this->subdomain,
            'email' => $this->email,
            'currency' => $this->currency,
            'users_count' => $this->when(isset($this->users_count), $this->users_count),
            'customers_count' => $this->when(isset($this->customers_count), $this->customers_count),
            'subscription_status' => $subscription?->status->value,
            'plan_name' => $subscription?->plan?->name,
            'plan_price' => $subscription?->plan?->price,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}

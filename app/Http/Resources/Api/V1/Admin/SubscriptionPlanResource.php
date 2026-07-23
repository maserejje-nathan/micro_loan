<?php

namespace App\Http\Resources\Api\V1\Admin;

use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SubscriptionPlan
 */
class SubscriptionPlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'currency' => $this->currency,
            'billing_interval' => $this->billing_interval->value,
            'trial_days' => $this->trial_days,
            'max_users' => $this->max_users,
            'max_customers' => $this->max_customers,
            'max_active_loans' => $this->max_active_loans,
            'features' => $this->features ?? [],
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'subscriptions_count' => $this->when(isset($this->subscriptions_count), $this->subscriptions_count),
            'active_subscriptions_count' => $this->when(
                isset($this->active_subscriptions_count),
                $this->active_subscriptions_count,
            ),
        ];
    }
}

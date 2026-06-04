<?php

namespace App\Http\Requests\Admin;

use App\Enums\BillingInterval;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubscriptionPlanRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $features = $this->input('features');

        if (is_string($features)) {
            $this->merge([
                'features' => $features === ''
                    ? []
                    : array_values(array_filter(array_map('trim', explode(',', $features)))),
            ]);
        }

        $this->merge([
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $planId = $this->route('plan')?->id ?? $this->route('plan');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('subscription_plans', 'slug')->ignore($planId)],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'billing_interval' => ['required', Rule::enum(BillingInterval::class)],
            'trial_days' => ['required', 'integer', 'min:0'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_customers' => ['nullable', 'integer', 'min:1'],
            'max_active_loans' => ['nullable', 'integer', 'min:1'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}

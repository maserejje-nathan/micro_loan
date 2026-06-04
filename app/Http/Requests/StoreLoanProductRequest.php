<?php

namespace App\Http\Requests;

use App\Enums\InterestType;
use App\Enums\RepaymentFrequency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoanProductRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge(['is_active' => $this->boolean('is_active')]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->hasPermission('loan_products.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'alpha_dash'],
            'min_amount' => ['required', 'integer', 'min:1'],
            'max_amount' => ['required', 'integer', 'gt:min_amount'],
            'interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'interest_type' => ['required', Rule::enum(InterestType::class)],
            'term_min_days' => ['required', 'integer', 'min:1'],
            'term_max_days' => ['required', 'integer', 'gte:term_min_days'],
            'repayment_frequency' => ['required', Rule::enum(RepaymentFrequency::class)],
            'grace_period_days' => ['nullable', 'integer', 'min:0'],
            'processing_fee' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}

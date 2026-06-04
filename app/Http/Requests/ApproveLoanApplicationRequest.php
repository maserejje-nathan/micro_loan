<?php

namespace App\Http\Requests;

use App\Models\LoanApplication;
use App\Support\LoanProductLimitValidator;
use App\Support\MobileMoneyConfig;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ApproveLoanApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('loan_applications.approve') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $canDisburse = $this->user()?->hasPermission('loans.disburse') ?? false;

        return [
            'approved_amount' => ['nullable', 'integer', 'min:1'],
            'term_days' => ['nullable', 'integer', 'min:1'],
            'disburse_via_mobile_money' => ['sometimes', 'boolean'],
            'phone' => [
                Rule::requiredIf($canDisburse && $this->boolean('disburse_via_mobile_money')),
                'nullable',
                'string',
                'max:20',
            ],
            'provider' => ['nullable', 'string', 'in:mtn,airtel'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var LoanApplication $application */
            $application = $this->route('loan_application');
            $product = $application->loanProduct;

            $amount = (int) ($this->input('approved_amount') ?? $application->requested_amount);
            $term = (int) ($this->input('term_days') ?? $application->term_days);

            $errors = LoanProductLimitValidator::errors($product, $amount, $term);

            foreach ($errors as $field => $message) {
                $validator->errors()->add(
                    $field === 'amount' ? 'approved_amount' : 'term_days',
                    $message,
                );
            }

            if (
                $this->boolean('disburse_via_mobile_money')
                && ($this->user()?->hasPermission('loans.disburse') ?? false)
                && ! MobileMoneyConfig::summary()['can_disburse']
            ) {
                $validator->errors()->add(
                    'disburse_via_mobile_money',
                    'Yo! Payments is not configured. Set credentials under Platform settings or disburse manually from the loan page.',
                );
            }
        });
    }
}

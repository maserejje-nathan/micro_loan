<?php

namespace App\Http\Requests;

use App\Enums\PaymentChannel;
use App\Support\MobileMoneyConfig;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreRepaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('repayments.manage') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('channel') !== PaymentChannel::MobileMoney->value) {
            $this->merge([
                'phone' => null,
                'provider' => null,
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isMobileMoney = $this->input('channel') === PaymentChannel::MobileMoney->value;

        return [
            'loan_id' => ['required', 'exists:loans,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'channel' => ['required', Rule::enum(PaymentChannel::class)],
            'phone' => [Rule::requiredIf($isMobileMoney), 'nullable', 'string', 'max:20'],
            'provider' => [Rule::requiredIf($isMobileMoney), 'nullable', 'string', 'in:mtn,airtel'],
            'loan_schedule_id' => ['nullable', 'exists:loan_schedules,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (
                $this->input('channel') === PaymentChannel::MobileMoney->value
                && ! MobileMoneyConfig::summary()['can_disburse']
            ) {
                $validator->errors()->add(
                    'channel',
                    'Yo! Payments is not configured. Add credentials under Platform settings → Yo! Payments.',
                );
            }
        });
    }
}

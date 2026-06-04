<?php

namespace App\Http\Requests;

use App\Enums\PaymentChannel;
use App\Support\MobileMoneyConfig;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class DisburseLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('loans.disburse') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'channel' => ['required', Rule::enum(PaymentChannel::class)],
            'phone' => [Rule::requiredIf($this->input('channel') === PaymentChannel::MobileMoney->value), 'nullable', 'string', 'max:20'],
            'provider' => ['nullable', 'string', 'in:mtn,airtel'],
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

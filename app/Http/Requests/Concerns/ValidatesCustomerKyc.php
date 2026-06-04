<?php

namespace App\Http\Requests\Concerns;

use App\Enums\CustomerEmploymentStatus;
use App\Enums\CustomerGender;
use App\Enums\CustomerIdType;
use Illuminate\Validation\Rule;

trait ValidatesCustomerKyc
{
    protected function prepareKycForValidation(): void
    {
        $nullable = [
            'gender',
            'id_type',
            'employment_status',
            'date_of_birth',
            'id_expiry_date',
            'nationality',
            'district',
            'city',
            'occupation',
            'employer_name',
            'next_of_kin_name',
            'next_of_kin_phone',
            'next_of_kin_relationship',
            'monthly_income',
        ];

        foreach ($nullable as $field) {
            if ($this->input($field) === '' || $this->input($field) === null) {
                $this->merge([$field => null]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function customerKycRules(): array
    {
        return [
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::enum(CustomerGender::class)],
            'nationality' => ['nullable', 'string', 'max:100'],
            'id_type' => ['nullable', Rule::enum(CustomerIdType::class)],
            'id_expiry_date' => ['nullable', 'date'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'employment_status' => ['nullable', Rule::enum(CustomerEmploymentStatus::class)],
            'employer_name' => ['nullable', 'string', 'max:255'],
            'monthly_income' => ['nullable', 'integer', 'min:0'],
            'next_of_kin_name' => ['nullable', 'string', 'max:255'],
            'next_of_kin_phone' => ['nullable', 'string', 'max:20'],
            'next_of_kin_relationship' => ['nullable', 'string', 'max:100'],
        ];
    }
}

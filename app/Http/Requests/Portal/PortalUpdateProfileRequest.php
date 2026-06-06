<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;

class PortalUpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('portal') !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'employer_name' => ['nullable', 'string', 'max:150'],
            'monthly_income' => ['nullable', 'integer', 'min:0'],
            'next_of_kin_name' => ['nullable', 'string', 'max:150'],
            'next_of_kin_phone' => ['nullable', 'string', 'max:20'],
            'next_of_kin_relationship' => ['nullable', 'string', 'max:50'],
        ];
    }
}

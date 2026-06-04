<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateYoPaymentsSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_super_admin ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'mobile_money_driver' => ['required', Rule::in(['stub', 'yo'])],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'account' => ['nullable', 'string', 'max:255'],
            'sandbox' => ['boolean'],
            'non_blocking' => ['boolean'],
            'api_url' => ['nullable', 'url', 'max:500'],
            'sandbox_api_url' => ['nullable', 'url', 'max:500'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sandbox' => $this->boolean('sandbox'),
            'non_blocking' => $this->boolean('non_blocking'),
        ]);
    }
}

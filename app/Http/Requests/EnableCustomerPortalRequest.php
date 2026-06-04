<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnableCustomerPortalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('customers.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'password' => ['nullable', 'string', 'min:8', 'max:72'],
        ];
    }
}

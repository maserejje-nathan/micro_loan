<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SendTestSmsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_super_admin ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge([
                'phone' => preg_replace('/\s+/', '', $this->string('phone')->toString()) ?? '',
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'max:20', 'regex:/^\+?[0-9]{9,15}$/'],
            'message' => ['nullable', 'string', 'max:160'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid phone number (digits only, optional leading +).',
        ];
    }
}

<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePortalSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('settings.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
            'allow_applications' => ['required', 'boolean'],
            'allow_self_registration' => ['required', 'boolean'],
            'welcome_message' => ['nullable', 'string', 'max:500'],
        ];
    }
}

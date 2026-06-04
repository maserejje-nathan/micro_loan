<?php

namespace App\Http\Requests\Admin;

use App\Support\PlatformSettingsDefaults;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNotificationSettingsRequest extends FormRequest
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
            'sms_driver' => ['required', Rule::in(['log', 'africas_talking'])],
            'enabled_types' => ['required', 'array'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $enabled = [];

        foreach (array_keys(PlatformSettingsDefaults::NOTIFICATION_TYPES) as $type) {
            $enabled[$type] = filter_var(
                $this->input("enabled_types.{$type}", false),
                FILTER_VALIDATE_BOOLEAN,
            );
        }

        $this->merge(['enabled_types' => $enabled]);
    }
}

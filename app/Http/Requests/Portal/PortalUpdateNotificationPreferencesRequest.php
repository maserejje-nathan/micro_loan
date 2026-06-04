<?php

namespace App\Http\Requests\Portal;

use App\Http\Requests\Concerns\ValidatesPaymentReminderChannels;
use Illuminate\Foundation\Http\FormRequest;

class PortalUpdateNotificationPreferencesRequest extends FormRequest
{
    use ValidatesPaymentReminderChannels;

    public function authorize(): bool
    {
        return $this->user('portal') !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->preparePaymentReminderChannelsForValidation();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->paymentReminderChannelRules();
    }
}

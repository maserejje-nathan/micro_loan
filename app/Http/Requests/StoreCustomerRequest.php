<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesCustomerIdDocuments;
use App\Http\Requests\Concerns\ValidatesCustomerKyc;
use App\Http\Requests\Concerns\ValidatesCustomerPhoto;
use App\Http\Requests\Concerns\ValidatesPaymentReminderChannels;
use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    use ValidatesCustomerIdDocuments;
    use ValidatesCustomerKyc;
    use ValidatesCustomerPhoto;
    use ValidatesPaymentReminderChannels;

    public function authorize(): bool
    {
        return $this->user()?->hasPermission('customers.manage') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->prepareKycForValidation();
        $this->preparePhotoForValidation();
        $this->prepareIdDocumentForValidation();
        $this->preparePaymentReminderChannelsForValidation();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'national_id' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            ...$this->customerKycRules(),
            ...$this->customerPhotoRules(),
            ...$this->customerIdDocumentRules(),
            ...$this->paymentReminderChannelRules(),
        ];
    }
}

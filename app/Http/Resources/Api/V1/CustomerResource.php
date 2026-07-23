<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Customer;
use App\Services\CustomerIdDocumentService;
use App\Services\CustomerPhotoService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Customer
 */
class CustomerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->fullName(),
            'phone' => $this->phone,
            'email' => $this->email,
            'national_id' => $this->national_id,
            'id_type' => $this->id_type?->value,
            'id_expiry_date' => $this->id_expiry_date?->toDateString(),
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender?->value,
            'nationality' => $this->nationality,
            'address' => $this->address,
            'district' => $this->district,
            'city' => $this->city,
            'occupation' => $this->occupation,
            'employment_status' => $this->employment_status?->value,
            'employer_name' => $this->employer_name,
            'monthly_income' => $this->monthly_income,
            'next_of_kin_name' => $this->next_of_kin_name,
            'next_of_kin_phone' => $this->next_of_kin_phone,
            'next_of_kin_relationship' => $this->next_of_kin_relationship,
            'status' => $this->status->value,
            'payment_reminder_channels' => $this->paymentReminderChannels(),
            'photo_url' => app(CustomerPhotoService::class)->url($this->resource),
            'id_front_url' => app(CustomerIdDocumentService::class)->frontUrl($this->resource),
            'id_back_url' => app(CustomerIdDocumentService::class)->backUrl($this->resource),
            'portal_enabled' => $this->portal_enabled,
            'portal_enabled_at' => $this->portal_enabled_at?->toDateTimeString(),
            'portal_last_login_at' => $this->portal_last_login_at?->toDateTimeString(),
            'organization' => $this->when(
                $this->relationLoaded('organization') && $this->organization !== null,
                fn () => OrganizationResource::make($this->organization)->resolve(),
            ),
        ];
    }
}

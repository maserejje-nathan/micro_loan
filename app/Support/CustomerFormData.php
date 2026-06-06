<?php

namespace App\Support;

use App\Enums\CustomerEmploymentStatus;
use App\Enums\CustomerGender;
use App\Enums\CustomerIdType;
use App\Models\Customer;
use App\Services\CustomerIdDocumentService;
use App\Services\CustomerPhotoService;

class CustomerFormData
{
    /**
     * @return array<string, mixed>
     */
    public static function customerPayload(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'reference_number' => $customer->reference_number,
            'first_name' => $customer->first_name,
            'last_name' => $customer->last_name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'payment_reminder_channels' => $customer->paymentReminderChannels(),
            'national_id' => $customer->national_id,
            'id_type' => $customer->id_type?->value,
            'id_expiry_date' => $customer->id_expiry_date?->toDateString(),
            'date_of_birth' => $customer->date_of_birth?->toDateString(),
            'gender' => $customer->gender?->value,
            'nationality' => $customer->nationality,
            'district' => $customer->district,
            'city' => $customer->city,
            'address' => $customer->address,
            'occupation' => $customer->occupation,
            'employment_status' => $customer->employment_status?->value,
            'employer_name' => $customer->employer_name,
            'monthly_income' => $customer->monthly_income,
            'next_of_kin_name' => $customer->next_of_kin_name,
            'next_of_kin_phone' => $customer->next_of_kin_phone,
            'next_of_kin_relationship' => $customer->next_of_kin_relationship,
            'photo_url' => app(CustomerPhotoService::class)->url($customer),
            'id_front_url' => app(CustomerIdDocumentService::class)->frontUrl($customer),
            'id_back_url' => app(CustomerIdDocumentService::class)->backUrl($customer),
            'status' => $customer->status->value,
        ];
    }

    /**
     * @return array{
     *     genders: list<array{value: string, label: string}>,
     *     idTypes: list<array{value: string, label: string}>,
     *     employmentStatuses: list<array{value: string, label: string}>
     * }
     */
    public static function kycOptions(): array
    {
        return [
            'genders' => collect(CustomerGender::cases())
                ->map(fn (CustomerGender $gender) => [
                    'value' => $gender->value,
                    'label' => match ($gender) {
                        CustomerGender::Male => 'Male',
                        CustomerGender::Female => 'Female',
                        CustomerGender::Other => 'Other',
                    },
                ])
                ->values()
                ->all(),
            'idTypes' => collect(CustomerIdType::cases())
                ->map(fn (CustomerIdType $idType) => [
                    'value' => $idType->value,
                    'label' => match ($idType) {
                        CustomerIdType::NationalId => 'National ID (NIN)',
                        CustomerIdType::Passport => 'Passport',
                        CustomerIdType::DrivingLicense => 'Driving licence',
                        CustomerIdType::VoterId => 'Voter ID',
                    },
                ])
                ->values()
                ->all(),
            'notificationChannels' => CustomerNotificationChannels::options(),
            'employmentStatuses' => collect(CustomerEmploymentStatus::cases())
                ->map(fn (CustomerEmploymentStatus $status) => [
                    'value' => $status->value,
                    'label' => match ($status) {
                        CustomerEmploymentStatus::Employed => 'Employed',
                        CustomerEmploymentStatus::SelfEmployed => 'Self-employed',
                        CustomerEmploymentStatus::Unemployed => 'Unemployed',
                        CustomerEmploymentStatus::Student => 'Student',
                        CustomerEmploymentStatus::Retired => 'Retired',
                    },
                ])
                ->values()
                ->all(),
        ];
    }
}

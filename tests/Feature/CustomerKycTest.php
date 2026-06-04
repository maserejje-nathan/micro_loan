<?php

use App\Enums\CustomerEmploymentStatus;
use App\Enums\CustomerGender;
use App\Enums\CustomerIdType;
use App\Models\Customer;
use App\Models\User;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());
});

test('owner can create customer with kyc details', function () {
    $this->post(route('customers.store'), [
        'first_name' => 'Jane',
        'last_name' => 'Namukasa',
        'phone' => '256700000099',
        'email' => 'jane@example.com',
        'national_id' => 'CM12345678ABCDE',
        'id_type' => CustomerIdType::NationalId->value,
        'id_expiry_date' => '2030-12-31',
        'date_of_birth' => '1990-05-15',
        'gender' => CustomerGender::Female->value,
        'nationality' => 'Ugandan',
        'district' => 'Kampala',
        'city' => 'Kampala',
        'address' => 'Plot 12, Kampala Road',
        'occupation' => 'Shop owner',
        'employment_status' => CustomerEmploymentStatus::SelfEmployed->value,
        'employer_name' => 'Namukasa Retail',
        'monthly_income' => 1_500_000,
        'next_of_kin_name' => 'John Namukasa',
        'next_of_kin_phone' => '256700000001',
        'next_of_kin_relationship' => 'Spouse',
    ])->assertRedirect(route('customers.index'));

    $customer = Customer::query()->first();

    expect($customer)->not->toBeNull()
        ->and($customer->national_id)->toBe('CM12345678ABCDE')
        ->and($customer->id_type)->toBe(CustomerIdType::NationalId)
        ->and($customer->gender)->toBe(CustomerGender::Female)
        ->and($customer->employment_status)->toBe(CustomerEmploymentStatus::SelfEmployed)
        ->and($customer->monthly_income)->toBe(1_500_000)
        ->and($customer->next_of_kin_name)->toBe('John Namukasa');
});

test('owner can update customer kyc details', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $this->put(route('customers.update', $customer), [
        'first_name' => $customer->first_name,
        'last_name' => $customer->last_name,
        'phone' => $customer->phone,
        'status' => $customer->status->value,
        'national_id' => 'CM99999999ZZZZZ',
        'id_type' => CustomerIdType::Passport->value,
        'employment_status' => CustomerEmploymentStatus::Employed->value,
        'employer_name' => 'Acme Ltd',
        'monthly_income' => 2_000_000,
    ])->assertRedirect(route('customers.show', $customer));

    $customer->refresh();

    expect($customer->national_id)->toBe('CM99999999ZZZZZ')
        ->and($customer->id_type)->toBe(CustomerIdType::Passport)
        ->and($customer->employer_name)->toBe('Acme Ltd');
});

test('customer create page includes kyc options', function () {
    $this->get(route('customers.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('genders', 3)
            ->has('idTypes', 4)
            ->has('employmentStatuses', 5));
});

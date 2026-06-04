<?php

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\SmsNotification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());
});

test('owner can create customer and loan product', function () {
    $this->post(route('customers.store'), [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'phone' => '256700000001',
    ])->assertRedirect(route('customers.index'));

    expect(Customer::query()->count())->toBe(1);

    $this->post(route('loan-products.store'), [
        'name' => 'Business Loan',
        'code' => 'BL1',
        'min_amount' => 100_000,
        'max_amount' => 2_000_000,
        'interest_rate' => 12,
        'interest_type' => 'flat',
        'term_min_days' => 30,
        'term_max_days' => 180,
        'repayment_frequency' => 'monthly',
        'is_active' => true,
    ])->assertRedirect(route('loan-products.index'));

    expect(LoanProduct::query()->count())->toBe(1);
});

test('full loan lifecycle from application to repayment', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);
    $product = LoanProduct::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $this->post(route('loan-applications.store'), [
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'requested_amount' => 500_000,
        'term_days' => 90,
        'purpose' => 'Inventory',
    ])->assertRedirect();

    $application = LoanApplication::query()->first();
    expect($application->status)->toBe(LoanApplicationStatus::Draft);

    $this->post(route('loan-applications.submit', $application))
        ->assertRedirect();

    expect($application->fresh()->status)->toBe(LoanApplicationStatus::Submitted);

    $this->post(route('loan-applications.approve', $application), [
        'approved_amount' => 500_000,
    ])->assertRedirect();

    $loan = Loan::query()->first();
    expect($loan->status)->toBe(LoanStatus::PendingDisbursement);
    expect(SmsNotification::query()->where('type', 'loan_approved')->exists())->toBeTrue();

    $this->post(route('loans.disburse', $loan), [
        'channel' => 'mobile_money',
        'phone' => $customer->phone,
        'provider' => 'mtn',
    ])->assertRedirect(route('loans.show', $loan));

    $loan->refresh();
    expect($loan->status)->toBe(LoanStatus::Active);
    expect($loan->schedules)->not->toBeEmpty();

    $this->post(route('repayments.store'), [
        'loan_id' => $loan->id,
        'amount' => 100_000,
        'channel' => 'cash',
    ])->assertRedirect(route('loans.show', $loan));

    expect($loan->fresh()->outstanding_balance)->toBe($loan->total_repayable - 100_000);
});

test('approving with mobile money disburse activates loan immediately', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000099',
    ]);
    $product = LoanProduct::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $this->post(route('loan-applications.store'), [
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'requested_amount' => 300_000,
        'term_days' => 60,
    ]);

    $application = LoanApplication::query()->first();
    $this->post(route('loan-applications.submit', $application));

    $this->post(route('loan-applications.approve', $application), [
        'approved_amount' => 300_000,
        'term_days' => 60,
        'disburse_via_mobile_money' => true,
        'phone' => $customer->phone,
        'provider' => 'mtn',
    ])->assertRedirect()
        ->assertSessionHas('success');

    $loan = Loan::query()->first();
    expect($loan->status)->toBe(LoanStatus::Active);
    expect($loan->disbursement)->not->toBeNull();
    expect($loan->disbursement->channel->value)->toBe('mobile_money');
    expect($loan->schedules)->not->toBeEmpty();
});

test('failed mobile money disbursement leaves loan pending disbursement', function () {
    config(['payments.mobile_money_driver' => 'yo']);

    Http::fake([
        '*' => Http::response(<<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate><Response><Status>ERROR</Status><StatusMessage>Insufficient funds</StatusMessage></Response></AutoCreate>
XML),
    ]);

    config([
        'payments.yo.username' => 'test',
        'payments.yo.password' => 'secret',
        'payments.yo.sandbox' => true,
    ]);

    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);
    $product = LoanProduct::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $this->post(route('loan-applications.store'), [
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'requested_amount' => 200_000,
        'term_days' => 30,
    ]);
    $application = LoanApplication::query()->first();
    $this->post(route('loan-applications.submit', $application));
    $this->post(route('loan-applications.approve', $application), [
        'approved_amount' => 200_000,
    ]);

    $loan = Loan::query()->first();
    expect($loan->status)->toBe(LoanStatus::PendingDisbursement);

    $this->post(route('loans.disburse', $loan), [
        'channel' => 'mobile_money',
        'phone' => $customer->phone,
        'provider' => 'mtn',
    ])->assertRedirect()
        ->assertSessionHasErrors('channel');

    expect($loan->fresh()->status)->toBe(LoanStatus::PendingDisbursement);
});

test('organization onboarding creates workspace', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('onboarding.organization.store'), [
        'name' => 'Kampala Micro Loans',
    ])->assertRedirect(route('dashboard'));

    expect($user->fresh()->current_organization_id)->not->toBeNull();
});

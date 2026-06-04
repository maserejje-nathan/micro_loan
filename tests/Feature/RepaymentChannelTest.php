<?php

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());

    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);
    $product = LoanProduct::factory()->create([
        'organization_id' => $this->organization->id,
    ]);
    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'APP-RP-'.fake()->unique()->numerify('####'),
        'requested_amount' => 500_000,
        'term_days' => 90,
        'status' => LoanApplicationStatus::Approved,
        'approved_amount' => 500_000,
    ]);

    $this->loan = Loan::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'loan_application_id' => $application->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'LN-RP-'.fake()->unique()->numerify('####'),
        'principal' => 500_000,
        'interest_rate' => 10,
        'interest_type' => 'flat',
        'term_days' => 90,
        'repayment_frequency' => 'monthly',
        'total_interest' => 50_000,
        'total_repayable' => 550_000,
        'outstanding_balance' => 550_000,
        'status' => LoanStatus::Active,
        'disbursed_at' => now(),
    ]);
});

test('cash repayment does not require mobile money fields', function () {
    $this->post(route('repayments.store'), [
        'loan_id' => $this->loan->id,
        'amount' => 50_000,
        'channel' => 'cash',
        'phone' => '256700000099',
        'provider' => 'mtn',
    ])->assertRedirect(route('loans.show', $this->loan));

    expect($this->loan->fresh()->outstanding_balance)->toBe(500_000);
});

test('mobile money repayment requires phone and provider', function () {
    $this->post(route('repayments.store'), [
        'loan_id' => $this->loan->id,
        'amount' => 50_000,
        'channel' => 'mobile_money',
    ])->assertSessionHasErrors(['phone', 'provider']);
});

test('mobile money repayment collects via yo payments gateway', function () {
    config([
        'payments.mobile_money_driver' => 'yo',
        'payments.yo.username' => 'test',
        'payments.yo.password' => 'secret',
        'payments.yo.sandbox' => true,
    ]);

    Http::fake([
        '*' => Http::response(<<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate><Response><Status>OK</Status><TransactionReference>YO-COLLECT-1</TransactionReference></Response></AutoCreate>
XML),
    ]);

    $customer = $this->loan->customer;

    $this->post(route('repayments.store'), [
        'loan_id' => $this->loan->id,
        'amount' => 50_000,
        'channel' => 'mobile_money',
        'phone' => $customer->phone,
        'provider' => 'mtn',
    ])->assertRedirect(route('loans.show', $this->loan))
        ->assertSessionHas('success');

    $repayment = $this->loan->fresh()->repayments()->first();
    expect($repayment)->not->toBeNull();
    expect($repayment->channel->value)->toBe('mobile_money');
    expect($repayment->mobile_money_reference)->toBe('YO-COLLECT-1');
    expect($this->loan->fresh()->outstanding_balance)->toBe(500_000);
});

test('failed yo collection does not record repayment', function () {
    config([
        'payments.mobile_money_driver' => 'yo',
        'payments.yo.username' => 'test',
        'payments.yo.password' => 'secret',
        'payments.yo.sandbox' => true,
    ]);

    Http::fake([
        '*' => Http::response(<<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<AutoCreate><Response><Status>ERROR</Status><StatusMessage>Declined</StatusMessage></Response></AutoCreate>
XML),
    ]);

    $this->post(route('repayments.store'), [
        'loan_id' => $this->loan->id,
        'amount' => 50_000,
        'channel' => 'mobile_money',
        'phone' => $this->loan->customer->phone,
        'provider' => 'mtn',
    ])->assertRedirect()
        ->assertSessionHasErrors('channel');

    expect($this->loan->fresh()->outstanding_balance)->toBe(550_000);
    expect($this->loan->repayments()->count())->toBe(0);
});

test('repayment create page includes mobile money config', function () {
    $this->get(route('repayments.create', ['loan_id' => $this->loan->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('repayments/create')
            ->has('mobileMoney')
            ->has('defaultPaymentChannel')
        );
});

<?php

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\Repayment;
use App\Models\User;
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
        'reference_number' => 'APP-RP-PG-'.fake()->unique()->numerify('####'),
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
        'reference_number' => 'LN-RP-PG-'.fake()->unique()->numerify('####'),
        'principal' => 500_000,
        'interest_rate' => 10,
        'interest_type' => 'flat',
        'term_days' => 90,
        'repayment_frequency' => 'monthly',
        'total_interest' => 50_000,
        'total_repayable' => 550_000,
        'outstanding_balance' => 450_000,
        'status' => LoanStatus::Active,
        'disbursed_at' => now(),
    ]);

    Repayment::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'loan_id' => $this->loan->id,
        'reference_number' => 'RP-PG-'.fake()->unique()->numerify('####'),
        'amount' => 100_000,
        'channel' => 'cash',
        'received_by' => $this->user->id,
        'paid_at' => now(),
    ]);
});

test('repayments index returns stats and enriched rows', function () {
    $this->get(route('repayments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('repayments/index')
            ->where('currency', 'UGX')
            ->where('canRecordRepayment', true)
            ->has('stats', fn ($stats) => $stats
                ->where('total', 1)
                ->where('total_collected', 100_000)
                ->where('active_loans', 1)
                ->etc()
            )
            ->has('repayments.data', 1)
            ->has('repayments.data.0', fn ($row) => $row
                ->where('loan_id', $this->loan->id)
                ->has('customer_id')
                ->etc()
            )
        );
});

test('repayments create includes selected loan from query', function () {
    $this->get(route('repayments.create', ['loan_id' => $this->loan->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('repayments/create')
            ->where('currency', 'UGX')
            ->where('canRecordRepayment', true)
            ->has('selectedLoan', fn ($loan) => $loan
                ->where('id', $this->loan->id)
                ->where('outstanding_balance', 450_000)
                ->etc()
            )
            ->where('values.loan_id', $this->loan->id)
        );
});

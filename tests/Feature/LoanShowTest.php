<?php

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\User;
use App\Services\LoanScheduleGenerator;
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
        'reference_number' => 'APP-LS-'.fake()->unique()->numerify('####'),
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
        'reference_number' => 'LN-LS-'.fake()->unique()->numerify('####'),
        'principal' => 500_000,
        'interest_rate' => 10,
        'interest_type' => 'flat',
        'term_days' => 90,
        'repayment_frequency' => 'monthly',
        'total_interest' => 50_000,
        'total_repayable' => 550_000,
        'outstanding_balance' => 400_000,
        'status' => LoanStatus::Active,
        'disbursed_at' => now(),
    ]);

    app(LoanScheduleGenerator::class)->generate($this->loan);
});

test('loan show page returns enriched loan details', function () {
    $this->get(route('loans.show', $this->loan))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('loans/show')
            ->where('currency', 'UGX')
            ->where('canRecordRepayment', true)
            ->has('loan', fn ($loan) => $loan
                ->where('id', $this->loan->id)
                ->where('total_repaid', 150_000)
                ->where('repayment_progress', 27)
                ->has('customer.id')
                ->has('product.name')
                ->has('loan_application_id')
                ->etc()
            )
            ->has('schedules')
            ->where('disbursement', null)
            ->has('mobileMoney')
        );
});

test('repayment create preselects loan from query string', function () {
    $this->get(route('repayments.create', ['loan_id' => $this->loan->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('repayments/create')
            ->where('values.loan_id', $this->loan->id)
        );
});

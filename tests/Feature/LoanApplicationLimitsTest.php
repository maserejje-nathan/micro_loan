<?php

use App\Enums\LoanApplicationStatus;
use App\Models\Customer;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\User;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());

    $this->customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);
    $this->product = LoanProduct::factory()->create([
        'organization_id' => $this->organization->id,
        'term_min_days' => 30,
        'term_max_days' => 180,
    ]);
});

test('cannot create application with term outside product limits', function () {
    $this->post(route('loan-applications.store'), [
        'customer_id' => $this->customer->id,
        'loan_product_id' => $this->product->id,
        'requested_amount' => 500_000,
        'term_days' => 7,
    ])->assertSessionHasErrors('term_days');

    expect(LoanApplication::query()->count())->toBe(0);
});

test('can approve application with corrected term within product limits', function () {
    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'customer_id' => $this->customer->id,
        'loan_product_id' => $this->product->id,
        'reference_number' => 'APP-LIM-001',
        'requested_amount' => 500_000,
        'term_days' => 7,
        'status' => LoanApplicationStatus::Submitted,
        'created_by' => $this->user->id,
    ]);

    $this->post(route('loan-applications.approve', $application), [
        'term_days' => 90,
    ])->assertRedirect();

    expect($application->fresh()->term_days)->toBe(90)
        ->and($application->fresh()->status)->toBe(LoanApplicationStatus::Approved);
});

test('cannot approve when term remains outside product limits', function () {
    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'customer_id' => $this->customer->id,
        'loan_product_id' => $this->product->id,
        'reference_number' => 'APP-LIM-002',
        'requested_amount' => 500_000,
        'term_days' => 7,
        'status' => LoanApplicationStatus::Submitted,
        'created_by' => $this->user->id,
    ]);

    $this->post(route('loan-applications.approve', $application))
        ->assertSessionHasErrors('term_days');
});

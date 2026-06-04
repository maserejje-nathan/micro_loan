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

    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
    ]);
    $product = LoanProduct::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $this->application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'APP-SHOW-'.fake()->unique()->numerify('####'),
        'requested_amount' => 500_000,
        'term_days' => 90,
        'purpose' => 'Business inventory',
        'status' => LoanApplicationStatus::Submitted,
        'created_by' => $this->user->id,
    ]);
});

test('loan application show page returns enriched details', function () {
    $this->get(route('loan-applications.show', $this->application))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('loan-applications/show')
            ->where('currency', 'UGX')
            ->has('mobileMoney')
            ->has('application', fn ($app) => $app
                ->where('reference_number', $this->application->reference_number)
                ->where('purpose', 'Business inventory')
                ->where('status', 'submitted')
                ->has('estimate.total_repayable')
                ->has('customer.email')
                ->has('product.interest_rate')
                ->etc()
            )
        );
});

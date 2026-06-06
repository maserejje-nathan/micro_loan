<?php

use App\Enums\CollateralType;
use App\Enums\LoanApplicationStatus;
use App\Models\Customer;
use App\Models\LoanApplication;
use App\Models\LoanApplicationCollateral;
use App\Models\LoanProduct;
use App\Models\User;
use App\Services\CustomerPortalService;
use App\Support\OrganizationPortalSettings;
use Illuminate\Support\Facades\Auth;
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
    ]);
});

test('staff can create loan application with collateral', function () {
    $this->post(route('loan-applications.store'), [
        'customer_id' => $this->customer->id,
        'loan_product_id' => $this->product->id,
        'requested_amount' => 500_000,
        'term_days' => 90,
        'purpose' => 'Inventory',
        'collaterals' => [
            [
                'type' => CollateralType::Vehicle->value,
                'description' => 'Toyota Premio 2015, silver',
                'estimated_value' => 8_000_000,
                'identifier' => 'UBH 123A',
            ],
            [
                'type' => CollateralType::Equipment->value,
                'description' => 'Industrial sewing machine',
                'estimated_value' => 1_500_000,
            ],
        ],
    ])->assertRedirect();

    $application = LoanApplication::query()->first();

    expect($application)->not->toBeNull()
        ->and($application->collaterals)->toHaveCount(2)
        ->and($application->collaterals->first()->type)->toBe(CollateralType::Vehicle)
        ->and($application->collaterals->first()->identifier)->toBe('UBH 123A');
});

test('loan application collateral validation rejects invalid items', function () {
    $this->post(route('loan-applications.store'), [
        'customer_id' => $this->customer->id,
        'loan_product_id' => $this->product->id,
        'requested_amount' => 500_000,
        'term_days' => 90,
        'collaterals' => [
            [
                'type' => 'invalid',
                'description' => '',
                'estimated_value' => 0,
            ],
        ],
    ])->assertSessionHasErrors([
        'collaterals.0.type',
        'collaterals.0.description',
        'collaterals.0.estimated_value',
    ]);

    expect(LoanApplication::query()->count())->toBe(0);
});

test('loan application show page includes collateral details', function () {
    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'customer_id' => $this->customer->id,
        'loan_product_id' => $this->product->id,
        'reference_number' => 'APP-COL-'.fake()->unique()->numerify('####'),
        'requested_amount' => 500_000,
        'term_days' => 90,
        'status' => LoanApplicationStatus::Submitted,
        'created_by' => $this->user->id,
    ]);

    LoanApplicationCollateral::query()->create([
        'loan_application_id' => $application->id,
        'type' => CollateralType::Property,
        'description' => 'Plot 12, Ntinda',
        'estimated_value' => 25_000_000,
        'identifier' => 'Block 45',
    ]);

    $this->get(route('loan-applications.show', $application))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('loan-applications/show')
            ->has('application.collaterals', 1, fn ($collateral) => $collateral
                ->where('type', 'property')
                ->where('description', 'Plot 12, Ntinda')
                ->where('estimated_value', 25_000_000)
                ->where('identifier', 'Block 45')
                ->etc()
            )
        );
});

test('portal customer can create application with collateral', function () {
    Auth::guard('portal')->logout();

    OrganizationPortalSettings::merge($this->organization, [
        'enabled' => true,
        'allow_applications' => true,
    ]);

    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000321',
    ]);

    app(CustomerPortalService::class)->enable($customer, 'portal-secret');

    $this->post(route('portal.login.store'), [
        'phone' => $customer->phone,
        'password' => 'portal-secret',
        'organization_slug' => $this->organization->slug,
    ])->assertRedirect(route('portal.dashboard'));

    $this->post(route('portal.applications.store'), [
        'loan_product_id' => $this->product->id,
        'requested_amount' => 300_000,
        'term_days' => 60,
        'collaterals' => [
            [
                'type' => CollateralType::Livestock->value,
                'description' => 'Three Friesian cows',
                'estimated_value' => 4_500_000,
            ],
        ],
    ])->assertRedirect();

    $application = LoanApplication::withoutGlobalScopes()
        ->where('customer_id', $customer->id)
        ->first();

    expect($application)->not->toBeNull()
        ->and($application->collaterals)->toHaveCount(1)
        ->and($application->collaterals->first()->type)->toBe(CollateralType::Livestock);
});

<?php

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\User;
use App\Services\CustomerPortalService;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

beforeEach(function () {
    Storage::fake('local');
    $this->user = User::factory()->create();
    $this->organization = $this->setupOrganization($this->user);
    $this->actingAs($this->user->fresh());

    Auth::guard('portal')->logout();

    OrganizationPortalSettings::merge($this->organization, [
        'enabled' => true,
        'allow_applications' => true,
        'allow_self_registration' => true,
    ]);
});

test('owner can update client portal settings', function () {
    $this->put(route('settings.portal.update'), [
        'enabled' => true,
        'allow_applications' => false,
        'allow_self_registration' => true,
        'welcome_message' => 'Welcome to your account.',
    ])->assertRedirect();

    $settings = OrganizationPortalSettings::for($this->organization->fresh());

    expect($settings['enabled'])->toBeTrue()
        ->and($settings['allow_applications'])->toBeFalse()
        ->and($settings['allow_self_registration'])->toBeTrue()
        ->and($settings['welcome_message'])->toBe('Welcome to your account.');
});

test('customer can self register and access portal', function () {
    OrganizationPortalSettings::merge($this->organization, [
        'allow_self_registration' => true,
    ]);

    $this->post(route('portal.register.store'), [
        'first_name' => 'Grace',
        'last_name' => 'Nakato',
        'phone' => '256700000999',
        'email' => 'grace@example.com',
        'password' => 'SecurePass1!',
        'password_confirmation' => 'SecurePass1!',
        'address' => 'Plot 12 Kampala Road',
        'city' => 'Kampala',
        'organization_slug' => $this->organization->slug,
        'id_front' => UploadedFile::fake()->image('id-front.jpg'),
        'id_back' => UploadedFile::fake()->image('id-back.jpg'),
    ])->assertRedirect(route('portal.dashboard'));

    $customer = Customer::query()
        ->withoutGlobalScopes()
        ->where('organization_id', $this->organization->id)
        ->where('phone', '256700000999')
        ->first();

    expect($customer)->not->toBeNull()
        ->and($customer->portal_enabled)->toBeTrue()
        ->and($customer->first_name)->toBe('Grace')
        ->and($customer->email)->toBe('grace@example.com')
        ->and($customer->id_front_path)->not->toBeNull()
        ->and($customer->id_back_path)->not->toBeNull()
        ->and(Hash::check('SecurePass1!', $customer->portal_password))->toBeTrue();

    Storage::disk('local')->assertExists($customer->id_front_path);
    Storage::disk('local')->assertExists($customer->id_back_path);

    $this->get(route('portal.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('portal/dashboard'));
});

test('self registration is rejected when disabled', function () {
    OrganizationPortalSettings::merge($this->organization, [
        'allow_self_registration' => false,
    ]);

    $this->post(route('portal.register.store'), [
        'first_name' => 'Test',
        'last_name' => 'User',
        'phone' => '256700000888',
        'password' => 'SecurePass1!',
        'password_confirmation' => 'SecurePass1!',
        'organization_slug' => $this->organization->slug,
        'id_front' => UploadedFile::fake()->image('id-front.jpg'),
        'id_back' => UploadedFile::fake()->image('id-back.jpg'),
    ])->assertForbidden();

    expect(Customer::query()
        ->withoutGlobalScopes()
        ->where('phone', '256700000888')
        ->exists())->toBeFalse();
});

test('register page redirects when self registration is disabled', function () {
    OrganizationPortalSettings::merge($this->organization, [
        'allow_self_registration' => false,
    ]);

    $this->withSession(['portal_organization_id' => $this->organization->id])
        ->get(route('portal.register'))
        ->assertRedirect(route('portal.login'));
});

test('self registration rejects duplicate phone', function () {
    OrganizationPortalSettings::merge($this->organization, [
        'allow_self_registration' => true,
    ]);

    Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000777',
    ]);

    $this->post(route('portal.register.store'), [
        'first_name' => 'Another',
        'last_name' => 'Person',
        'phone' => '256700000777',
        'password' => 'SecurePass1!',
        'password_confirmation' => 'SecurePass1!',
        'organization_slug' => $this->organization->slug,
        'id_front' => UploadedFile::fake()->image('id-front.jpg'),
        'id_back' => UploadedFile::fake()->image('id-back.jpg'),
    ])->assertSessionHasErrors('phone');
});

test('self registration requires id document images', function () {
    $this->post(route('portal.register.store'), [
        'first_name' => 'Grace',
        'last_name' => 'Nakato',
        'phone' => '256700000998',
        'password' => 'SecurePass1!',
        'password_confirmation' => 'SecurePass1!',
        'organization_slug' => $this->organization->slug,
    ])->assertSessionHasErrors(['id_front', 'id_back']);
});

test('owner can enable portal access for a customer', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000123',
    ]);

    $this->post(route('customers.portal.enable', $customer), [
        'password' => 'portal-secret',
    ])
        ->assertRedirect()
        ->assertSessionHas('portal_password', 'portal-secret');

    $customer->refresh();

    expect($customer->portal_enabled)->toBeTrue()
        ->and(Hash::check('portal-secret', $customer->portal_password))->toBeTrue();
});

test('customer can sign in and view dashboard and loans', function () {
    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000456',
    ]);

    app(CustomerPortalService::class)->enable($customer, 'borrower-pass');

    $product = LoanProduct::factory()->create([
        'organization_id' => $this->organization->id,
    ]);

    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'APP-PORTAL-'.fake()->unique()->numerify('####'),
        'requested_amount' => 500_000,
        'term_days' => 90,
        'status' => LoanApplicationStatus::Approved,
        'approved_amount' => 500_000,
    ]);

    Loan::withoutGlobalScopes()->create([
        'organization_id' => $this->organization->id,
        'loan_application_id' => $application->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'LN-PORTAL-'.fake()->unique()->numerify('####'),
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

    $this->post(route('portal.login.store'), [
        'phone' => $customer->phone,
        'password' => 'borrower-pass',
        'organization_slug' => $this->organization->slug,
    ])->assertRedirect(route('portal.dashboard'));

    $this->get(route('portal.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('portal/dashboard')
            ->has('stats')
            ->has('recentLoans')
            ->has('recentApplications')
            ->where('auth.organization.slug', $this->organization->slug));

    $this->get(route('portal.loans.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('portal/loans/index')
            ->has('loans.data', 1)
            ->where('filter', 'all'));
});

test('portal customer can view profile photo', function () {
    Storage::fake('local');

    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000321',
    ]);

    app(CustomerPortalService::class)->enable($customer, 'borrower-pass');

    $path = "organizations/{$this->organization->id}/customers/{$customer->id}/photo.jpg";
    Storage::disk('local')->put($path, UploadedFile::fake()->image('stored.jpg')->getContent());
    $customer->update(['photo_path' => $path]);

    $this->post(route('portal.login.store'), [
        'phone' => $customer->phone,
        'password' => 'borrower-pass',
        'organization_slug' => $this->organization->slug,
    ])->assertRedirect(route('portal.dashboard'));

    $this->get(route('portal.profile.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('portal/profile')
            ->where('customer.photo_url', route('portal.profile.photo')));

    $this->get(route('portal.profile.photo'))
        ->assertSuccessful();
});

test('portal login is rejected when organization portal is disabled', function () {
    OrganizationPortalSettings::merge($this->organization, ['enabled' => false]);
    OrganizationContext::set($this->organization->fresh());

    $customer = Customer::factory()->create([
        'organization_id' => $this->organization->id,
        'phone' => '256700000789',
        'portal_enabled' => true,
        'portal_password' => Hash::make('secret'),
    ]);

    $this->post(route('portal.login.store'), [
        'phone' => $customer->phone,
        'password' => 'secret',
        'organization_slug' => $this->organization->slug,
    ])->assertForbidden();
});

<?php

namespace Database\Seeders;

use App\Enums\CollateralType;
use App\Enums\LoanApplicationStatus;
use App\Enums\PaymentChannel;
use App\Models\Customer;
use App\Models\LoanApplication;
use App\Models\LoanApplicationCollateral;
use App\Models\LoanProduct;
use App\Models\Organization;
use App\Models\User;
use App\Services\CustomerPortalService;
use App\Services\LoanApplicationService;
use App\Services\LoanDisbursementService;
use App\Services\OrganizationSetupService;
use App\Services\ReferenceNumberGenerator;
use App\Services\RepaymentService;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $organizationName = env('DEMO_ORGANIZATION_NAME', 'Kampala Micro Loans');

        if (Organization::query()->where('slug', Str::slug($organizationName))->exists()) {
            return;
        }

        $owner = User::query()->updateOrCreate(
            ['email' => env('DEMO_OWNER_EMAIL', 'owner@demo.lendflow.test')],
            [
                'name' => env('DEMO_OWNER_NAME', 'Sarah Nakato'),
                'password' => Hash::make(env('DEMO_OWNER_PASSWORD', 'password')),
                'email_verified_at' => now(),
            ],
        );

        $setup = app(OrganizationSetupService::class);
        $organization = $setup->createForUser($owner, $organizationName);

        OrganizationContext::set($organization);

        OrganizationPortalSettings::merge($organization, [
            'enabled' => true,
            'allow_applications' => true,
            'allow_self_registration' => false,
            'welcome_message' => 'Welcome to your borrower portal. View loans, balances, and submit applications online.',
        ]);

        $businessProduct = LoanProduct::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Business Loan',
            'code' => 'BL',
            'min_amount' => 100_000,
            'max_amount' => 3_000_000,
            'interest_rate' => 12,
            'term_min_days' => 30,
            'term_max_days' => 180,
            'processing_fee' => 25_000,
            'description' => 'Working capital and inventory financing for small businesses.',
        ]);

        $personalProduct = LoanProduct::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Personal Loan',
            'code' => 'PL',
            'min_amount' => 50_000,
            'max_amount' => 1_500_000,
            'interest_rate' => 15,
            'term_min_days' => 14,
            'term_max_days' => 90,
            'processing_fee' => 10_000,
            'description' => 'Short-term personal loans for school fees and emergencies.',
        ]);

        $jane = Customer::factory()->create([
            'organization_id' => $organization->id,
            'first_name' => 'Jane',
            'last_name' => 'Okello',
            'phone' => '256700000100',
            'email' => 'jane.okello@example.com',
            'occupation' => 'Shop owner',
            'monthly_income' => 1_200_000,
        ]);

        $peter = Customer::factory()->create([
            'organization_id' => $organization->id,
            'first_name' => 'Peter',
            'last_name' => 'Mukasa',
            'phone' => '256700000101',
            'email' => 'peter.mukasa@example.com',
            'occupation' => 'Boda rider',
            'monthly_income' => 800_000,
        ]);

        $grace = Customer::factory()->create([
            'organization_id' => $organization->id,
            'first_name' => 'Grace',
            'last_name' => 'Nambi',
            'phone' => '256700000102',
            'email' => 'grace.nambi@example.com',
            'occupation' => 'Teacher',
            'monthly_income' => 1_500_000,
        ]);

        $referenceNumberGenerator = app(ReferenceNumberGenerator::class);
        $loanApplicationService = app(LoanApplicationService::class);

        $draftApplication = LoanApplication::query()->create([
            'organization_id' => $organization->id,
            'customer_id' => $grace->id,
            'loan_product_id' => $personalProduct->id,
            'reference_number' => $referenceNumberGenerator->generate(
                new LoanApplication(['organization_id' => $organization->id]),
                'APP',
            ),
            'requested_amount' => 300_000,
            'term_days' => 60,
            'purpose' => 'School fees for second term',
            'status' => LoanApplicationStatus::Draft,
            'created_by' => $owner->id,
        ]);

        LoanApplicationCollateral::query()->create([
            'loan_application_id' => $draftApplication->id,
            'type' => CollateralType::Electronics,
            'description' => 'HP laptop, 15-inch, serial LF-2024-0192',
            'estimated_value' => 1_800_000,
            'identifier' => 'LF-2024-0192',
        ]);

        $submittedApplication = LoanApplication::query()->create([
            'organization_id' => $organization->id,
            'customer_id' => $peter->id,
            'loan_product_id' => $businessProduct->id,
            'reference_number' => $referenceNumberGenerator->generate(
                new LoanApplication(['organization_id' => $organization->id]),
                'APP',
            ),
            'requested_amount' => 750_000,
            'term_days' => 90,
            'purpose' => 'Motorcycle maintenance and spare parts',
            'status' => LoanApplicationStatus::Submitted,
            'created_by' => $owner->id,
        ]);

        LoanApplicationCollateral::query()->create([
            'loan_application_id' => $submittedApplication->id,
            'type' => CollateralType::Vehicle,
            'description' => 'Bajaj Boxer motorcycle, red',
            'estimated_value' => 4_500_000,
            'identifier' => 'UBE 452K',
        ]);

        $approvedApplication = LoanApplication::query()->create([
            'organization_id' => $organization->id,
            'customer_id' => $jane->id,
            'loan_product_id' => $businessProduct->id,
            'reference_number' => $referenceNumberGenerator->generate(
                new LoanApplication(['organization_id' => $organization->id]),
                'APP',
            ),
            'requested_amount' => 1_000_000,
            'term_days' => 120,
            'purpose' => 'Shop restock before festive season',
            'status' => LoanApplicationStatus::Submitted,
            'created_by' => $owner->id,
        ]);

        $activeLoan = $loanApplicationService->approve($approvedApplication, $owner, 1_000_000, 120);

        app(LoanDisbursementService::class)->disburse($activeLoan, $owner, [
            'channel' => PaymentChannel::Cash->value,
        ]);

        $activeLoan->refresh();

        app(RepaymentService::class)->record($activeLoan, $owner, [
            'amount' => 150_000,
            'channel' => PaymentChannel::Cash->value,
        ]);

        app(CustomerPortalService::class)->enable($jane, env('DEMO_PORTAL_PASSWORD', 'portal-demo'));

        OrganizationContext::clear();
    }
}

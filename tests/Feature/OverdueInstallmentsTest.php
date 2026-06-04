<?php

use App\Enums\LoanStatus;
use App\Enums\ScheduleInstallmentStatus;
use App\Enums\SmsStatus;
use App\Jobs\ProcessOverdueInstallmentsJob;
use App\Enums\LoanApplicationStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\LoanSchedule;
use App\Models\SmsNotification;
use App\Models\User;
use Illuminate\Support\Facades\Bus;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('overdue command dispatches jobs per organization', function () {
    Bus::fake();

    $user = User::factory()->create();
    $this->setupOrganization($user);

    $this->artisan('loans:process-overdue')->assertSuccessful();

    Bus::assertDispatched(ProcessOverdueInstallmentsJob::class);
});

test('overdue job marks installments and sends reminder sms', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);

    $customer = Customer::factory()->create(['organization_id' => $organization->id]);
    $product = LoanProduct::factory()->create(['organization_id' => $organization->id]);

    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $organization->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'APP-TEST-0001',
        'requested_amount' => 500_000,
        'term_days' => 90,
        'status' => LoanApplicationStatus::Approved,
        'approved_amount' => 500_000,
    ]);

    $loan = Loan::withoutGlobalScopes()->create([
        'organization_id' => $organization->id,
        'loan_application_id' => $application->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'LN-TEST-0001',
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

    $schedule = LoanSchedule::query()->create([
        'loan_id' => $loan->id,
        'installment_number' => 1,
        'due_date' => now()->subDays(5),
        'principal_amount' => 400_000,
        'interest_amount' => 50_000,
        'total_amount' => 450_000,
        'paid_amount' => 0,
        'status' => ScheduleInstallmentStatus::Pending,
    ]);

    (new ProcessOverdueInstallmentsJob($organization->id))->handle(app(\App\Services\PaymentReminderService::class));

    expect($schedule->fresh()->status)->toBe(ScheduleInstallmentStatus::Overdue);
    expect($schedule->fresh()->overdue_notified_at)->not->toBeNull();
    expect(SmsNotification::query()->where('type', 'overdue_reminder')->where('status', SmsStatus::Sent)->exists())->toBeTrue();
});

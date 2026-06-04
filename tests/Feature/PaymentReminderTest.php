<?php

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Enums\ScheduleInstallmentStatus;
use App\Enums\SmsStatus;
use App\Jobs\ProcessOverdueInstallmentsJob;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\LoanSchedule;
use App\Models\SmsNotification;
use App\Models\User;
use Tests\Support\ActsAsOrganization;

uses(ActsAsOrganization::class);

test('overdue job sends reminder on customer selected sms channel', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'payment_reminder_channels' => ['sms'],
    ]);

    $schedule = createOverdueSchedule($organization, $customer);

    (new ProcessOverdueInstallmentsJob($organization->id))->handle(app(\App\Services\PaymentReminderService::class));

    expect($schedule->fresh()->status)->toBe(ScheduleInstallmentStatus::Overdue)
        ->and(SmsNotification::query()->where('type', 'overdue_reminder')->where('status', SmsStatus::Sent)->exists())->toBeTrue();
});

test('overdue job sends email when customer selected email channel', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'email' => 'borrower@example.com',
        'payment_reminder_channels' => ['email'],
    ]);

    $schedule = createOverdueSchedule($organization, $customer);

    (new ProcessOverdueInstallmentsJob($organization->id))->handle(app(\App\Services\PaymentReminderService::class));

    expect(SmsNotification::query()->where('type', 'overdue_reminder')->exists())->toBeFalse()
        ->and($schedule->fresh()->overdue_notified_at)->not->toBeNull();
});

test('staff can manually send payment reminder for installment', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);
    $this->actingAs($user);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'payment_reminder_channels' => ['sms'],
    ]);

    $schedule = createOverdueSchedule($organization, $customer);

    $this->post(route('loans.schedules.payment-reminder', [
        'loan' => $schedule->loan_id,
        'schedule' => $schedule->id,
    ]))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(SmsNotification::query()->where('type', 'overdue_reminder')->count())->toBe(1);
});

test('manual reminder fails when email channel selected but no email on file', function () {
    $user = User::factory()->create();
    $organization = $this->setupOrganization($user);
    $this->actingAs($user);

    $customer = Customer::factory()->create([
        'organization_id' => $organization->id,
        'email' => null,
        'payment_reminder_channels' => ['email'],
    ]);

    $schedule = createOverdueSchedule($organization, $customer);

    $this->post(route('loans.schedules.payment-reminder', [
        'loan' => $schedule->loan_id,
        'schedule' => $schedule->id,
    ]))
        ->assertRedirect()
        ->assertSessionHas('error');
});

/**
 * @return LoanSchedule
 */
function createOverdueSchedule($organization, Customer $customer): LoanSchedule
{
    $product = LoanProduct::factory()->create(['organization_id' => $organization->id]);

    $application = LoanApplication::withoutGlobalScopes()->create([
        'organization_id' => $organization->id,
        'customer_id' => $customer->id,
        'loan_product_id' => $product->id,
        'reference_number' => 'APP-'.fake()->unique()->numerify('####'),
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
        'reference_number' => 'LN-'.fake()->unique()->numerify('####'),
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

    return LoanSchedule::query()->create([
        'loan_id' => $loan->id,
        'installment_number' => 1,
        'due_date' => now()->subDays(5),
        'principal_amount' => 400_000,
        'interest_amount' => 50_000,
        'total_amount' => 450_000,
        'paid_amount' => 0,
        'status' => ScheduleInstallmentStatus::Pending,
    ]);
}

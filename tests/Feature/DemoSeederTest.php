<?php

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanApplicationCollateral;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\DemoSeeder;
use Database\Seeders\SubscriptionPlanSeeder;
use Database\Seeders\SuperAdminSeeder;

test('demo seeder creates sample lending workspace', function () {
    $this->seed(SubscriptionPlanSeeder::class);
    $this->seed(SuperAdminSeeder::class);
    $this->seed(DemoSeeder::class);

    expect(Organization::query()->where('slug', 'kampala-micro-loans')->exists())->toBeTrue()
        ->and(User::query()->where('email', 'owner@demo.lendflow.test')->exists())->toBeTrue()
        ->and(Customer::withoutGlobalScopes()->count())->toBe(3)
        ->and(LoanApplication::withoutGlobalScopes()->count())->toBe(3)
        ->and(LoanApplicationCollateral::query()->count())->toBe(2)
        ->and(Loan::withoutGlobalScopes()->where('status', LoanStatus::Active)->count())->toBe(1)
        ->and(
            LoanApplication::withoutGlobalScopes()
                ->where('status', LoanApplicationStatus::Draft)
                ->exists(),
        )->toBeTrue()
        ->and(
            Customer::withoutGlobalScopes()
                ->where('portal_enabled', true)
                ->exists(),
        )->toBeTrue();
});

test('demo seeder is idempotent', function () {
    $this->seed(SubscriptionPlanSeeder::class);
    $this->seed(SuperAdminSeeder::class);
    $this->seed(DemoSeeder::class);
    $this->seed(DemoSeeder::class);

    expect(Organization::query()->where('slug', 'kampala-micro-loans')->count())->toBe(1)
        ->and(Customer::withoutGlobalScopes()->count())->toBe(3);
});

<?php

namespace App\Services;

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\Repayment;
use App\Support\LoanCalculatorCatalog;
use App\Support\OrganizationContext;
use Carbon\Carbon;

class DashboardStatsService
{
    /**
     * @return array{
     *     stats: array{
     *         active_loans: int,
     *         pending_applications: int,
     *         total_customers: int,
     *         portfolio_outstanding: int,
     *         repayments_this_month: int
     *     },
     *     recent_applications: list<array{
     *         id: int,
     *         reference_number: string,
     *         customer_name: string,
     *         product_name: string,
     *         requested_amount: int,
     *         status: string
     *     }>,
     *     currency: string,
     *     loan_calculator: array<string, mixed>
     * }
     */
    public function forCurrentOrganization(): array
    {
        $activeLoans = Loan::query()->where('status', LoanStatus::Active)->count();
        $pendingApplications = LoanApplication::query()
            ->whereIn('status', [
                LoanApplicationStatus::Submitted,
                LoanApplicationStatus::UnderReview,
            ])
            ->count();
        $totalCustomers = Customer::query()->count();
        $portfolioOutstanding = (int) Loan::query()
            ->where('status', LoanStatus::Active)
            ->sum('outstanding_balance');

        $repaymentsThisMonth = (int) Repayment::query()
            ->where('paid_at', '>=', Carbon::now()->startOfMonth())
            ->sum('amount');

        $recentApplications = LoanApplication::query()
            ->with(['customer', 'loanProduct'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (LoanApplication $application) => [
                'id' => $application->id,
                'reference_number' => $application->reference_number,
                'customer_name' => $application->customer->fullName(),
                'product_name' => $application->loanProduct->name,
                'requested_amount' => $application->requested_amount,
                'status' => $application->status->value,
            ])
            ->all();

        return [
            'stats' => [
                'active_loans' => $activeLoans,
                'pending_applications' => $pendingApplications,
                'total_customers' => $totalCustomers,
                'portfolio_outstanding' => $portfolioOutstanding,
                'repayments_this_month' => $repaymentsThisMonth,
            ],
            'recent_applications' => $recentApplications,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'loan_calculator' => LoanCalculatorCatalog::forOrganization(),
        ];
    }
}

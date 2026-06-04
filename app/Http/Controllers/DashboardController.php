<?php

namespace App\Http\Controllers;

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\Repayment;
use App\Support\LoanCalculatorCatalog;
use App\Support\OrganizationContext;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $organizationId = OrganizationContext::id();

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
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'active_loans' => $activeLoans,
                'pending_applications' => $pendingApplications,
                'total_customers' => $totalCustomers,
                'portfolio_outstanding' => $portfolioOutstanding,
                'repayments_this_month' => $repaymentsThisMonth,
            ],
            'recentApplications' => $recentApplications,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'loanCalculator' => LoanCalculatorCatalog::forOrganization(),
        ]);
    }
}

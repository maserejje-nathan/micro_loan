<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Enums\ScheduleInstallmentStatus;
use App\Models\Loan;
use App\Models\LoanSchedule;
use App\Models\Repayment;
use App\Support\ListPagination;
use App\Support\OrganizationContext;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $startOfMonth = Carbon::now()->startOfMonth();

        $disbursementsByMonth = Loan::query()
            ->whereNotNull('disbursed_at')
            ->get()
            ->groupBy(fn ($loan) => $loan->disbursed_at->format('Y-m'))
            ->map(fn ($group) => $group->sum('principal'));

        $repaymentsByMonth = Repayment::query()
            ->get()
            ->groupBy(fn ($r) => $r->paid_at->format('Y-m'))
            ->map(fn ($group) => $group->sum('amount'));

        $overdueCount = LoanSchedule::query()
            ->where('status', ScheduleInstallmentStatus::Overdue)
            ->orWhere(function ($query) {
                $query->where('status', ScheduleInstallmentStatus::Pending)
                    ->where('due_date', '<', now()->toDateString());
            })
            ->count();

        $statementLoans = Loan::query()
            ->with('customer')
            ->whereIn('status', [LoanStatus::Active, LoanStatus::Closed])
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (Loan $loan) => [
                'id' => $loan->id,
                'reference_number' => $loan->reference_number,
                'customer_name' => $loan->customer->fullName(),
                'statement_url' => route('loans.statement', $loan),
            ]);

        return Inertia::render('reports/index', [
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'statementLoans' => $statementLoans,
            'portfolio' => [
                'active_loans' => Loan::query()->where('status', LoanStatus::Active)->count(),
                'total_disbursed' => (int) Loan::query()->whereNotNull('disbursed_at')->sum('principal'),
                'outstanding' => (int) Loan::query()->where('status', LoanStatus::Active)->sum('outstanding_balance'),
                'collected_this_month' => (int) Repayment::query()
                    ->where('paid_at', '>=', $startOfMonth)
                    ->sum('amount'),
                'overdue_installments' => $overdueCount,
            ],
            'disbursementsByMonth' => $disbursementsByMonth,
            'repaymentsByMonth' => $repaymentsByMonth,
        ]);
    }
}

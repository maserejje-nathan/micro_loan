<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Enums\LoanStatus;
use App\Enums\ScheduleInstallmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Loan;
use App\Support\ListPagination;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $filter = $request->string('filter')->toString();
        if (! in_array($filter, ['all', 'active', 'closed'], true)) {
            $filter = 'all';
        }

        $closedStatuses = [
            LoanStatus::Closed,
            LoanStatus::Defaulted,
            LoanStatus::WrittenOff,
        ];

        $loansQuery = $customer->loans()
            ->with('loanProduct')
            ->latest()
            ->when(
                $filter === 'active',
                fn ($query) => $query->where('status', LoanStatus::Active),
            )
            ->when(
                $filter === 'closed',
                fn ($query) => $query->whereIn('status', $closedStatuses),
            );

        $loanRecords = $customer->loans()->get();

        $loans = $loansQuery
            ->paginate(ListPagination::perPage())
            ->through(function (Loan $loan) {
                $totalRepaid = max(0, $loan->total_repayable - $loan->outstanding_balance);

                return [
                    'id' => $loan->id,
                    'reference_number' => $loan->reference_number,
                    'product_name' => $loan->loanProduct->name,
                    'principal' => $loan->principal,
                    'total_repayable' => $loan->total_repayable,
                    'outstanding_balance' => $loan->outstanding_balance,
                    'total_repaid' => $totalRepaid,
                    'repayment_progress' => $loan->total_repayable > 0
                        ? (int) round(($totalRepaid / $loan->total_repayable) * 100)
                        : 0,
                    'status' => $loan->status->value,
                    'disbursed_at' => $loan->disbursed_at?->toDateString(),
                ];
            });

        return response()->json([
            'loans' => $loans,
            'filter' => $filter,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'stats' => [
                'total' => $loanRecords->count(),
                'active' => $loanRecords->where('status', LoanStatus::Active)->count(),
                'closed' => $loanRecords->whereIn('status', $closedStatuses)->count(),
                'outstanding' => (int) $loanRecords
                    ->where('status', LoanStatus::Active)
                    ->sum('outstanding_balance'),
                'total_repaid' => (int) $loanRecords->sum(
                    fn (Loan $loan) => max(0, $loan->total_repayable - $loan->outstanding_balance),
                ),
            ],
        ]);
    }

    public function show(Request $request, Loan $loan): JsonResponse
    {
        $this->authorizeLoan($request, $loan);

        $loan->load(['loanProduct']);
        $totalRepaid = max(0, $loan->total_repayable - $loan->outstanding_balance);

        $schedules = $loan->schedules()
            ->orderBy('installment_number')
            ->paginate(ListPagination::perPage(), pageName: 'schedules_page')
            ->through(fn ($schedule) => [
                'installment_number' => $schedule->installment_number,
                'due_date' => $schedule->due_date->toDateString(),
                'total_amount' => $schedule->total_amount,
                'paid_amount' => $schedule->paid_amount,
                'status' => $schedule->status->value,
            ]);

        $repayments = $loan->repayments()
            ->orderByDesc('paid_at')
            ->paginate(ListPagination::perPage(), pageName: 'repayments_page')
            ->through(fn ($repayment) => [
                'reference_number' => $repayment->reference_number,
                'amount' => $repayment->amount,
                'paid_at' => $repayment->paid_at->toDateTimeString(),
                'channel' => $repayment->channel->value,
            ]);

        $nextDue = $loan->schedules()
            ->whereNot('status', ScheduleInstallmentStatus::Paid)
            ->orderBy('installment_number')
            ->first();

        return response()->json([
            'loan' => [
                'id' => $loan->id,
                'reference_number' => $loan->reference_number,
                'principal' => $loan->principal,
                'total_interest' => $loan->total_interest,
                'total_repayable' => $loan->total_repayable,
                'outstanding_balance' => $loan->outstanding_balance,
                'total_repaid' => $totalRepaid,
                'repayment_progress' => $loan->total_repayable > 0
                    ? (int) round(($totalRepaid / $loan->total_repayable) * 100)
                    : 0,
                'status' => $loan->status->value,
                'term_days' => $loan->term_days,
                'interest_rate' => (float) $loan->interest_rate,
                'interest_type' => $loan->interest_type->value,
                'repayment_frequency' => $loan->repayment_frequency->value,
                'disbursed_at' => $loan->disbursed_at?->toDateString(),
                'closed_at' => $loan->closed_at?->toDateString(),
                'product_name' => $loan->loanProduct->name,
                'product_code' => $loan->loanProduct->code,
            ],
            'schedule_summary' => [
                'total' => $loan->schedules()->count(),
                'paid' => $loan->schedules()
                    ->where('status', ScheduleInstallmentStatus::Paid)
                    ->count(),
                'overdue' => $loan->schedules()
                    ->where('status', ScheduleInstallmentStatus::Overdue)
                    ->count(),
                'next_due' => $nextDue ? [
                    'installment_number' => $nextDue->installment_number,
                    'due_date' => $nextDue->due_date->toDateString(),
                    'remaining_amount' => $nextDue->remainingAmount(),
                ] : null,
            ],
            'schedules' => $schedules,
            'repayments' => $repayments,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
        ]);
    }

    protected function authorizeLoan(Request $request, Loan $loan): void
    {
        /** @var Customer $customer */
        $customer = $request->user();

        abort_unless(
            $loan->customer_id === $customer->id
                && $loan->organization_id === $customer->organization_id,
            403,
        );
    }
}

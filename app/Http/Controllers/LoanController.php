<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Enums\PaymentChannel;
use App\Http\Requests\DisburseLoanRequest;
use App\Models\Loan;
use App\Enums\ScheduleInstallmentStatus;
use App\Models\LoanSchedule;
use App\Services\LoanDisbursementService;
use App\Services\PaymentReminderService;
use App\Support\ListPagination;
use App\Support\MobileMoneyConfig;
use App\Support\OrganizationContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(): Response
    {
        $loans = Loan::query()
            ->with(['customer', 'loanProduct'])
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (Loan $loan) => [
                'id' => $loan->id,
                'reference_number' => $loan->reference_number,
                'customer_id' => $loan->customer_id,
                'customer_name' => $loan->customer->fullName(),
                'product_name' => $loan->loanProduct->name,
                'product_code' => $loan->loanProduct->code,
                'principal' => $loan->principal,
                'total_repayable' => $loan->total_repayable,
                'outstanding_balance' => $loan->outstanding_balance,
                'term_days' => $loan->term_days,
                'status' => $loan->status->value,
                'disbursed_at' => $loan->disbursed_at?->toDateString(),
            ]);

        return Inertia::render('loans/index', [
            'loans' => $loans,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'stats' => [
                'total' => Loan::query()->count(),
                'active' => Loan::query()->where('status', LoanStatus::Active)->count(),
                'pending_disbursement' => Loan::query()
                    ->where('status', LoanStatus::PendingDisbursement)
                    ->count(),
                'outstanding' => (int) Loan::query()
                    ->where('status', LoanStatus::Active)
                    ->sum('outstanding_balance'),
            ],
        ]);
    }

    public function show(Request $request, Loan $loan): Response
    {
        $loan->load(['customer', 'loanProduct', 'disbursement']);
        $user = $request->user();
        $totalRepaid = max(0, $loan->total_repayable - $loan->outstanding_balance);

        $schedules = $loan->schedules()
            ->orderBy('installment_number')
            ->paginate(ListPagination::perPage(), pageName: 'schedules_page')
            ->withQueryString()
            ->through(fn ($schedule) => [
                'id' => $schedule->id,
                'installment_number' => $schedule->installment_number,
                'due_date' => $schedule->due_date->toDateString(),
                'principal_amount' => $schedule->principal_amount,
                'interest_amount' => $schedule->interest_amount,
                'total_amount' => $schedule->total_amount,
                'paid_amount' => $schedule->paid_amount,
                'status' => $schedule->status->value,
                'can_send_reminder' => in_array($schedule->status, [
                    ScheduleInstallmentStatus::Pending,
                    ScheduleInstallmentStatus::Partial,
                    ScheduleInstallmentStatus::Overdue,
                ], true)
                    && $schedule->remainingAmount() > 0
                    && ($user?->hasPermission('repayments.manage') ?? false),
            ]);

        $repayments = $loan->repayments()
            ->orderByDesc('paid_at')
            ->paginate(ListPagination::perPage(), pageName: 'repayments_page')
            ->withQueryString()
            ->through(fn ($repayment) => [
                'id' => $repayment->id,
                'reference_number' => $repayment->reference_number,
                'amount' => $repayment->amount,
                'paid_at' => $repayment->paid_at->toDateTimeString(),
                'channel' => $repayment->channel->value,
            ]);

        return Inertia::render('loans/show', [
            'loan' => [
                'id' => $loan->id,
                'reference_number' => $loan->reference_number,
                'loan_application_id' => $loan->loan_application_id,
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
                'customer' => [
                    'id' => $loan->customer_id,
                    'name' => $loan->customer->fullName(),
                    'phone' => $loan->customer->phone,
                    'email' => $loan->customer->email,
                    'payment_reminder_channels' => $loan->customer->paymentReminderChannels(),
                ],
                'product' => [
                    'id' => $loan->loan_product_id,
                    'name' => $loan->loanProduct->name,
                    'code' => $loan->loanProduct->code,
                ],
            ],
            'scheduleSummary' => [
                'total' => $loan->schedules()->count(),
                'paid' => $loan->schedules()
                    ->where('status', ScheduleInstallmentStatus::Paid)
                    ->count(),
                'overdue' => $loan->schedules()
                    ->where('status', ScheduleInstallmentStatus::Overdue)
                    ->count(),
            ],
            'schedules' => $schedules,
            'disbursement' => $loan->disbursement ? [
                'amount' => $loan->disbursement->amount,
                'channel' => $loan->disbursement->channel->value,
                'status' => $loan->disbursement->status->value,
                'mobile_money_reference' => $loan->disbursement->mobile_money_reference,
                'disbursed_at' => $loan->disbursement->disbursed_at?->toDateTimeString(),
            ] : null,
            'repayments' => $repayments,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'paymentChannels' => array_column(PaymentChannel::cases(), 'value'),
            'canDisburse' => $loan->status === LoanStatus::PendingDisbursement
                && ($user?->hasPermission('loans.disburse') ?? false),
            'mobileMoney' => MobileMoneyConfig::summary(),
            'defaultDisbursementChannel' => MobileMoneyConfig::summary()['can_disburse']
                ? PaymentChannel::MobileMoney->value
                : PaymentChannel::Cash->value,
            'canRecordRepayment' => $loan->status === LoanStatus::Active
                && $loan->outstanding_balance > 0
                && ($user?->hasPermission('repayments.manage') ?? false),
            'statementUrl' => route('loans.statement', $loan),
        ]);
    }

    public function disburse(
        Loan $loan,
        DisburseLoanRequest $request,
        LoanDisbursementService $service,
    ): RedirectResponse {
        try {
            $service->disburse($loan, $request->user(), $request->validated());
        } catch (InvalidArgumentException $exception) {
            return back()
                ->withErrors(['channel' => $exception->getMessage()])
                ->withInput();
        }

        $channel = $request->validated('channel');
        $message = $channel === PaymentChannel::MobileMoney->value
            ? 'Loan disbursed to the borrower via mobile money.'
            : 'Loan disbursed successfully.';

        return redirect()
            ->route('loans.show', $loan)
            ->with('success', $message);
    }

    public function sendPaymentReminder(
        Loan $loan,
        LoanSchedule $schedule,
        PaymentReminderService $reminders,
    ): RedirectResponse {
        abort_unless($schedule->loan_id === $loan->id, 404);

        $result = $reminders->sendForSchedule($schedule);

        return back()->with(
            $result->ok ? 'success' : 'error',
            $result->message,
        );
    }
}

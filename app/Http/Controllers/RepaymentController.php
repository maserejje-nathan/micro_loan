<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Enums\PaymentChannel;
use App\Http\Requests\StoreRepaymentRequest;
use App\Models\Loan;
use App\Models\Repayment;
use App\Services\RepaymentService;
use App\Support\ListPagination;
use App\Support\MobileMoneyConfig;
use App\Support\OrganizationContext;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use InvalidArgumentException;
use Inertia\Inertia;
use Inertia\Response;

class RepaymentController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $monthStart = Carbon::now()->startOfMonth();

        $repayments = Repayment::query()
            ->with(['loan.customer'])
            ->latest('paid_at')
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (Repayment $repayment) => [
                'id' => $repayment->id,
                'reference_number' => $repayment->reference_number,
                'loan_id' => $repayment->loan_id,
                'loan_reference' => $repayment->loan->reference_number,
                'customer_id' => $repayment->loan->customer_id,
                'customer_name' => $repayment->loan->customer->fullName(),
                'amount' => $repayment->amount,
                'channel' => $repayment->channel->value,
                'mobile_money_reference' => $repayment->mobile_money_reference,
                'paid_at' => $repayment->paid_at->toDateTimeString(),
            ]);

        return Inertia::render('repayments/index', [
            'repayments' => $repayments,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'canRecordRepayment' => $user?->hasPermission('repayments.manage') ?? false,
            'stats' => [
                'total' => Repayment::query()->count(),
                'total_collected' => (int) Repayment::query()->sum('amount'),
                'collected_this_month' => (int) Repayment::query()
                    ->where('paid_at', '>=', $monthStart)
                    ->sum('amount'),
                'active_loans' => Loan::query()
                    ->where('status', LoanStatus::Active)
                    ->where('outstanding_balance', '>', 0)
                    ->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $loans = Loan::query()
            ->where('status', LoanStatus::Active)
            ->where('outstanding_balance', '>', 0)
            ->with('customer')
            ->orderBy('reference_number')
            ->get()
            ->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'reference_number' => $loan->reference_number,
                'customer_id' => $loan->customer_id,
                'customer_name' => $loan->customer->fullName(),
                'customer_phone' => $loan->customer->phone,
                'outstanding_balance' => $loan->outstanding_balance,
                'total_repayable' => $loan->total_repayable,
            ]);

        $loanId = old('loan_id', request()->integer('loan_id') ?: null);
        $selectedLoan = $loans->firstWhere('id', (int) $loanId);
        $defaultPhone = is_array($selectedLoan)
            ? $selectedLoan['customer_phone']
            : null;
        $mobileMoney = MobileMoneyConfig::summary();
        $defaultChannel = $mobileMoney['can_disburse']
            ? PaymentChannel::MobileMoney->value
            : PaymentChannel::Cash->value;

        return Inertia::render('repayments/create', [
            'loans' => $loans->values(),
            'selectedLoan' => $selectedLoan,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'paymentChannels' => array_column(PaymentChannel::cases(), 'value'),
            'canRecordRepayment' => request()->user()?->hasPermission('repayments.manage') ?? false,
            'mobileMoney' => $mobileMoney,
            'defaultPaymentChannel' => $defaultChannel,
            'values' => [
                'loan_id' => $loanId,
                'amount' => old('amount'),
                'channel' => old('channel', $defaultChannel),
                'phone' => old('phone', $defaultPhone),
                'provider' => old('provider', 'mtn'),
            ],
        ]);
    }

    public function store(StoreRepaymentRequest $request, RepaymentService $service): RedirectResponse
    {
        $loan = Loan::query()->findOrFail($request->validated('loan_id'));
        $validated = $request->validated();

        try {
            $repayment = $service->record($loan, $request->user(), $validated);
        } catch (InvalidArgumentException $exception) {
            return back()
                ->withErrors(['channel' => $exception->getMessage()])
                ->withInput();
        }

        $message = $validated['channel'] === PaymentChannel::MobileMoney->value
            ? "Repayment {$repayment->reference_number} collected via mobile money (Yo! Payments)."
            : "Repayment {$repayment->reference_number} recorded.";

        return redirect()
            ->route('loans.show', $loan)
            ->with('success', $message);
    }
}

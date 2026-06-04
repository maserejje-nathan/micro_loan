<?php

namespace App\Http\Controllers;

use App\Enums\LoanApplicationStatus;
use App\Enums\PaymentChannel;
use App\Http\Requests\ApproveLoanApplicationRequest;
use App\Http\Requests\RejectLoanApplicationRequest;
use App\Http\Requests\StoreLoanApplicationRequest;
use App\Models\Customer;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\LoanApplicationService;
use App\Services\LoanCalculator;
use App\Services\LoanDisbursementService;
use App\Services\ReferenceNumberGenerator;
use App\Support\ListPagination;
use App\Support\MobileMoneyConfig;
use App\Support\OrganizationContext;
use Illuminate\Http\RedirectResponse;
use InvalidArgumentException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanApplicationController extends Controller
{
    public function index(): Response
    {
        $applications = LoanApplication::query()
            ->with(['customer', 'loanProduct'])
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (LoanApplication $application) => [
                'id' => $application->id,
                'reference_number' => $application->reference_number,
                'customer_id' => $application->customer_id,
                'customer_name' => $application->customer->fullName(),
                'product_name' => $application->loanProduct->name,
                'product_code' => $application->loanProduct->code,
                'requested_amount' => $application->requested_amount,
                'approved_amount' => $application->approved_amount,
                'term_days' => $application->term_days,
                'status' => $application->status->value,
                'created_at' => $application->created_at->toDateString(),
            ]);

        return Inertia::render('loan-applications/index', [
            'applications' => $applications,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'stats' => [
                'total' => LoanApplication::query()->count(),
                'pending' => LoanApplication::query()
                    ->whereIn('status', [
                        LoanApplicationStatus::Submitted,
                        LoanApplicationStatus::UnderReview,
                    ])
                    ->count(),
                'approved' => LoanApplication::query()
                    ->where('status', LoanApplicationStatus::Approved)
                    ->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('loan-applications/create', [
            'customers' => Customer::query()->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'phone']),
            'products' => LoanProduct::query()
                ->where('is_active', true)
                ->get([
                    'id',
                    'name',
                    'code',
                    'min_amount',
                    'max_amount',
                    'term_min_days',
                    'term_max_days',
                ]),
        ]);
    }

    public function store(
        StoreLoanApplicationRequest $request,
        ReferenceNumberGenerator $referenceNumberGenerator,
        AuditLogger $auditLogger,
    ): RedirectResponse {
        $application = LoanApplication::query()->create([
            ...$request->validated(),
            'reference_number' => $referenceNumberGenerator->generate(
                new LoanApplication,
                'APP',
            ),
            'status' => LoanApplicationStatus::Draft,
            'created_by' => $request->user()->id,
        ]);

        $auditLogger->log('loan_application.created', $application);

        return redirect()->route('loan-applications.show', $application);
    }

    public function show(LoanApplication $loanApplication, LoanCalculator $calculator): Response
    {
        $loanApplication->load(['customer', 'loanProduct', 'loan', 'reviewer']);
        $product = $loanApplication->loanProduct;

        $estimate = $calculator->estimate(
            $loanApplication->requested_amount,
            (float) $product->interest_rate,
            $product->interest_type,
            $loanApplication->term_days,
            (int) $product->processing_fee,
            $product->repayment_frequency,
        );

        $approvedEstimate = $loanApplication->approved_amount
            ? $calculator->estimate(
                $loanApplication->approved_amount,
                (float) $product->interest_rate,
                $product->interest_type,
                $loanApplication->term_days,
                (int) $product->processing_fee,
                $product->repayment_frequency,
            )
            : null;

        $creator = $loanApplication->created_by
            ? User::query()->find($loanApplication->created_by)
            : null;

        return Inertia::render('loan-applications/show', [
            'application' => [
                'id' => $loanApplication->id,
                'reference_number' => $loanApplication->reference_number,
                'requested_amount' => $loanApplication->requested_amount,
                'approved_amount' => $loanApplication->approved_amount,
                'term_days' => $loanApplication->term_days,
                'purpose' => $loanApplication->purpose,
                'status' => $loanApplication->status->value,
                'rejection_reason' => $loanApplication->rejection_reason,
                'created_at' => $loanApplication->created_at->toDateTimeString(),
                'reviewed_at' => $loanApplication->reviewed_at?->toDateTimeString(),
                'reviewer_name' => $loanApplication->reviewer?->name,
                'created_by_name' => $creator?->name,
                'customer' => [
                    'id' => $loanApplication->customer->id,
                    'name' => $loanApplication->customer->fullName(),
                    'phone' => $loanApplication->customer->phone,
                    'email' => $loanApplication->customer->email,
                ],
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'min_amount' => $product->min_amount,
                    'max_amount' => $product->max_amount,
                    'term_min_days' => $product->term_min_days,
                    'term_max_days' => $product->term_max_days,
                    'interest_rate' => (float) $product->interest_rate,
                    'interest_type' => $product->interest_type->value,
                    'repayment_frequency' => $product->repayment_frequency->value,
                    'processing_fee' => (int) $product->processing_fee,
                ],
                'estimate' => $estimate,
                'approved_estimate' => $approvedEstimate,
                'loan' => $loanApplication->loan ? [
                    'id' => $loanApplication->loan->id,
                    'reference_number' => $loanApplication->loan->reference_number,
                    'status' => $loanApplication->loan->status->value,
                    'principal' => $loanApplication->loan->principal,
                    'outstanding_balance' => $loanApplication->loan->outstanding_balance,
                ] : null,
            ],
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'canApprove' => request()->user()?->hasPermission('loan_applications.approve') ?? false,
            'canDisburse' => request()->user()?->hasPermission('loans.disburse') ?? false,
            'mobileMoney' => MobileMoneyConfig::summary(),
        ]);
    }

    public function submit(
        LoanApplication $loanApplication,
        LoanApplicationService $service,
        Request $request,
    ): RedirectResponse
    {
        $service->submit($loanApplication, $request->user());

        return back();
    }

    public function approve(
        LoanApplication $loanApplication,
        ApproveLoanApplicationRequest $request,
        LoanApplicationService $service,
        LoanDisbursementService $disbursementService,
    ): RedirectResponse {
        $validated = $request->validated();

        $loan = $service->approve(
            $loanApplication,
            $request->user(),
            $validated['approved_amount'] ?? null,
            $validated['term_days'] ?? null,
        );

        $shouldDisburse = $request->boolean('disburse_via_mobile_money')
            && ($request->user()?->hasPermission('loans.disburse') ?? false);

        if ($shouldDisburse) {
            try {
                $disbursementService->disburse($loan, $request->user(), [
                    'channel' => PaymentChannel::MobileMoney->value,
                    'phone' => $validated['phone'] ?? $loan->customer->phone,
                    'provider' => $validated['provider'] ?? 'mtn',
                ]);

                return redirect()
                    ->route('loans.show', $loan)
                    ->with(
                        'success',
                        'Loan approved and funds sent to the borrower via '.MobileMoneyConfig::summary()['driver_label'].'.',
                    );
            } catch (InvalidArgumentException $exception) {
                return redirect()
                    ->route('loans.show', $loan)
                    ->with(
                        'warning',
                        'Loan approved but mobile money disbursement failed: '.$exception->getMessage(),
                    );
            }
        }

        return redirect()
            ->route('loans.show', $loan)
            ->with(
                'success',
                'Loan approved. Disburse funds to the borrower to activate the loan.',
            );
    }

    public function reject(
        LoanApplication $loanApplication,
        RejectLoanApplicationRequest $request,
        LoanApplicationService $service,
    ): RedirectResponse {
        $service->reject($loanApplication, $request->user(), $request->validated('reason'));

        return back();
    }
}

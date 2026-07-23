<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LoanApplicationStatus;
use App\Enums\PaymentChannel;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveLoanApplicationRequest;
use App\Http\Requests\RejectLoanApplicationRequest;
use App\Http\Requests\StoreLoanApplicationRequest;
use App\Http\Resources\Api\V1\LoanApplicationResource;
use App\Http\Resources\Api\V1\LoanResource;
use App\Models\LoanApplication;
use App\Services\AuditLogger;
use App\Services\LoanApplicationService;
use App\Services\LoanDisbursementService;
use App\Services\ReferenceNumberGenerator;
use App\Support\ListPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;

class LoanApplicationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $applications = LoanApplication::query()
            ->with(['customer', 'loanProduct'])
            ->latest()
            ->paginate(ListPagination::perPage());

        return LoanApplicationResource::collection($applications);
    }

    public function store(
        StoreLoanApplicationRequest $request,
        ReferenceNumberGenerator $referenceNumberGenerator,
        AuditLogger $auditLogger,
        LoanApplicationService $loanApplicationService,
    ): JsonResponse {
        $validated = $request->validated();
        $collaterals = $validated['collaterals'] ?? [];
        unset($validated['collaterals']);

        $application = LoanApplication::query()->create([
            ...$validated,
            'reference_number' => $referenceNumberGenerator->generate(
                new LoanApplication,
                'APP',
            ),
            'status' => LoanApplicationStatus::Draft,
            'created_by' => $request->user()->id,
        ]);

        if ($collaterals !== []) {
            $loanApplicationService->storeCollaterals($application, $collaterals);
        }

        $auditLogger->log('loan_application.created', $application);

        $application->load(['customer', 'loanProduct', 'collaterals']);

        return LoanApplicationResource::make($application)
            ->response()
            ->setStatusCode(201);
    }

    public function show(LoanApplication $loanApplication): LoanApplicationResource
    {
        $loanApplication->load(['customer', 'loanProduct', 'loan', 'reviewer', 'collaterals']);

        return LoanApplicationResource::make($loanApplication);
    }

    public function submit(
        LoanApplication $loanApplication,
        LoanApplicationService $service,
        Request $request,
    ): LoanApplicationResource|JsonResponse {
        try {
            $application = $service->submit($loanApplication, $request->user());
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        $application->load(['customer', 'loanProduct', 'loan', 'reviewer', 'collaterals']);

        return LoanApplicationResource::make($application);
    }

    public function approve(
        LoanApplication $loanApplication,
        ApproveLoanApplicationRequest $request,
        LoanApplicationService $service,
        LoanDisbursementService $disbursementService,
    ): LoanResource|JsonResponse {
        $validated = $request->validated();

        try {
            $loan = $service->approve(
                $loanApplication,
                $request->user(),
                $validated['approved_amount'] ?? null,
                $validated['term_days'] ?? null,
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        $shouldDisburse = $request->boolean('disburse_via_mobile_money')
            && ($request->user()?->hasPermission('loans.disburse') ?? false);

        $warning = null;

        if ($shouldDisburse) {
            try {
                $disbursementService->disburse($loan, $request->user(), [
                    'channel' => PaymentChannel::MobileMoney->value,
                    'phone' => $validated['phone'] ?? $loan->customer->phone,
                    'provider' => $validated['provider'] ?? 'mtn',
                ]);
            } catch (InvalidArgumentException $exception) {
                $warning = $exception->getMessage();
            }
        }

        $loan->load(['customer', 'loanProduct', 'disbursement']);

        return response()->json([
            'data' => LoanResource::make($loan)->resolve(),
            'message' => $warning
                ? 'Loan approved but mobile money disbursement failed: '.$warning
                : ($shouldDisburse
                    ? 'Loan approved and disbursed.'
                    : 'Loan approved.'),
            'warning' => $warning,
        ]);
    }

    public function reject(
        LoanApplication $loanApplication,
        RejectLoanApplicationRequest $request,
        LoanApplicationService $service,
    ): LoanApplicationResource|JsonResponse {
        try {
            $service->reject($loanApplication, $request->user(), $request->validated('reason'));
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        $loanApplication->load(['customer', 'loanProduct', 'loan', 'reviewer', 'collaterals']);

        return LoanApplicationResource::make($loanApplication->fresh());
    }
}

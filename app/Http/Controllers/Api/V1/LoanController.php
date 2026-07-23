<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\DisburseLoanRequest;
use App\Http\Resources\Api\V1\LoanResource;
use App\Models\Loan;
use App\Services\LoanDisbursementService;
use App\Support\ListPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;

class LoanController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $loans = Loan::query()
            ->with(['customer', 'loanProduct'])
            ->latest()
            ->paginate(ListPagination::perPage());

        return LoanResource::collection($loans);
    }

    public function show(Loan $loan): LoanResource
    {
        $loan->load([
            'customer',
            'loanProduct',
            'disbursement',
            'schedules',
            'repayments' => fn ($query) => $query->latest('paid_at'),
        ]);

        return LoanResource::make($loan);
    }

    public function disburse(
        Loan $loan,
        DisburseLoanRequest $request,
        LoanDisbursementService $service,
    ): LoanResource|JsonResponse {
        if ($loan->status !== LoanStatus::PendingDisbursement) {
            return response()->json([
                'message' => 'Only loans pending disbursement can be disbursed.',
            ], 422);
        }

        try {
            $service->disburse($loan, $request->user(), $request->validated());
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $loan->load(['customer', 'loanProduct', 'disbursement']);

        return LoanResource::make($loan->fresh());
    }
}

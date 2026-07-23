<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LoanStatus;
use App\Enums\PaymentChannel;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRepaymentRequest;
use App\Http\Resources\Api\V1\RepaymentResource;
use App\Models\Loan;
use App\Models\Repayment;
use App\Services\RepaymentService;
use App\Support\ListPagination;
use App\Support\MobileMoneyConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;

class RepaymentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $repayments = Repayment::query()
            ->with(['loan.customer'])
            ->latest('paid_at')
            ->paginate(ListPagination::perPage());

        return RepaymentResource::collection($repayments);
    }

    public function create(): JsonResponse
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
            ])
            ->values();

        $mobileMoney = MobileMoneyConfig::summary();

        return response()->json([
            'loans' => $loans,
            'payment_channels' => array_column(PaymentChannel::cases(), 'value'),
            'mobile_money' => $mobileMoney,
            'default_payment_channel' => $mobileMoney['can_disburse']
                ? PaymentChannel::MobileMoney->value
                : PaymentChannel::Cash->value,
        ]);
    }

    public function store(
        StoreRepaymentRequest $request,
        RepaymentService $service,
    ): JsonResponse {
        $loan = Loan::query()->findOrFail($request->validated('loan_id'));

        try {
            $repayment = $service->record($loan, $request->user(), $request->validated());
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $repayment->load(['loan.customer']);

        return RepaymentResource::make($repayment)
            ->response()
            ->setStatusCode(201);
    }
}

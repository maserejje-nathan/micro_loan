<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLoanProductRequest;
use App\Http\Requests\UpdateLoanProductRequest;
use App\Http\Resources\Api\V1\LoanProductResource;
use App\Models\LoanProduct;
use App\Services\AuditLogger;
use App\Support\ListPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LoanProductController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $products = LoanProduct::query()
            ->latest()
            ->paginate(ListPagination::perPage());

        return LoanProductResource::collection($products);
    }

    public function store(StoreLoanProductRequest $request, AuditLogger $auditLogger): JsonResponse
    {
        $product = LoanProduct::query()->create($request->validated());
        $auditLogger->log('loan_product.created', $product);

        return LoanProductResource::make($product)
            ->response()
            ->setStatusCode(201);
    }

    public function show(LoanProduct $loanProduct): LoanProductResource
    {
        return LoanProductResource::make($loanProduct);
    }

    public function update(
        UpdateLoanProductRequest $request,
        LoanProduct $loanProduct,
        AuditLogger $auditLogger,
    ): LoanProductResource {
        $loanProduct->update($request->validated());
        $auditLogger->log('loan_product.updated', $loanProduct);

        return LoanProductResource::make($loanProduct->fresh());
    }
}

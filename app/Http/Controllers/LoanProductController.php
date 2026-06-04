<?php

namespace App\Http\Controllers;

use App\Enums\InterestType;
use App\Enums\RepaymentFrequency;
use App\Http\Requests\StoreLoanProductRequest;
use App\Http\Requests\UpdateLoanProductRequest;
use App\Models\LoanProduct;
use App\Services\AuditLogger;
use App\Support\ListPagination;
use App\Support\OrganizationContext;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LoanProductController extends Controller
{
    public function index(): Response
    {
        $products = LoanProduct::query()
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (LoanProduct $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->code,
                'min_amount' => $product->min_amount,
                'max_amount' => $product->max_amount,
                'interest_rate' => (string) $product->interest_rate,
                'interest_type' => $product->interest_type->value,
                'term_min_days' => $product->term_min_days,
                'term_max_days' => $product->term_max_days,
                'repayment_frequency' => $product->repayment_frequency->value,
                'is_active' => $product->is_active,
            ]);

        return Inertia::render('loan-products/index', [
            'products' => $products,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'stats' => [
                'total' => LoanProduct::query()->count(),
                'active' => LoanProduct::query()->where('is_active', true)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('loan-products/create', [
            'interestTypes' => array_column(InterestType::cases(), 'value'),
            'frequencies' => array_column(RepaymentFrequency::cases(), 'value'),
        ]);
    }

    public function store(StoreLoanProductRequest $request, AuditLogger $auditLogger): RedirectResponse
    {
        $product = LoanProduct::query()->create($request->validated());
        $auditLogger->log('loan_product.created', $product);

        return redirect()->route('loan-products.index');
    }

    public function edit(LoanProduct $loanProduct): Response
    {
        return Inertia::render('loan-products/edit', [
            'product' => [
                'id' => $loanProduct->id,
                'name' => $loanProduct->name,
                'code' => $loanProduct->code,
                'min_amount' => $loanProduct->min_amount,
                'max_amount' => $loanProduct->max_amount,
                'interest_rate' => $loanProduct->interest_rate,
                'interest_type' => $loanProduct->interest_type->value,
                'term_min_days' => $loanProduct->term_min_days,
                'term_max_days' => $loanProduct->term_max_days,
                'repayment_frequency' => $loanProduct->repayment_frequency->value,
                'grace_period_days' => $loanProduct->grace_period_days,
                'processing_fee' => $loanProduct->processing_fee,
                'description' => $loanProduct->description,
                'is_active' => $loanProduct->is_active,
            ],
            'interestTypes' => array_column(InterestType::cases(), 'value'),
            'frequencies' => array_column(RepaymentFrequency::cases(), 'value'),
        ]);
    }

    public function update(
        UpdateLoanProductRequest $request,
        LoanProduct $loanProduct,
        AuditLogger $auditLogger,
    ): RedirectResponse {
        $loanProduct->update($request->validated());
        $auditLogger->log('loan_product.updated', $loanProduct);

        return redirect()->route('loan-products.index');
    }
}

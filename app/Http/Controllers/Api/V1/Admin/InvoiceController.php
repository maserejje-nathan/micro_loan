<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInvoiceRequest;
use App\Http\Resources\Api\V1\Admin\InvoiceResource;
use App\Models\Invoice;
use App\Models\Organization;
use App\Services\BillingService;
use App\Support\ListPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InvoiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $status = $request->string('status')->toString();
        $activeStatus = InvoiceStatus::tryFrom($status)?->value;
        $search = trim($request->string('search')->toString());

        $invoices = Invoice::query()
            ->with('organization')
            ->when(
                $activeStatus,
                fn ($query) => $query->where('status', $activeStatus),
            )
            ->when(
                $search !== '',
                fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas(
                            'organization',
                            fn ($q) => $q->where('name', 'like', "%{$search}%"),
                        );
                }),
            )
            ->latest()
            ->paginate(ListPagination::perPage());

        return InvoiceResource::collection($invoices);
    }

    public function store(StoreInvoiceRequest $request, BillingService $billing): JsonResponse
    {
        $organization = Organization::query()->findOrFail($request->validated('organization_id'));
        $invoice = $billing->createManualInvoice(
            $organization,
            (int) $request->validated('amount'),
            $request->validated('description') ?? 'Manual invoice',
        );

        if ($request->validated('due_at')) {
            $invoice->update(['due_at' => $request->validated('due_at')]);
        }

        return InvoiceResource::make($invoice->load('organization'))
            ->response()
            ->setStatusCode(201);
    }

    public function markPaid(Invoice $invoice, BillingService $billing): InvoiceResource
    {
        $billing->markPaid($invoice);

        return InvoiceResource::make($invoice->fresh()->load('organization'));
    }
}

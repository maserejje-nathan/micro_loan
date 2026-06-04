<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInvoiceRequest;
use App\Models\Invoice;
use App\Models\Organization;
use App\Services\BillingService;
use App\Support\ListPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvoiceController extends Controller
{
    public function index(Request $request): Response
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
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (Invoice $invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'amount' => $invoice->amount,
                'currency' => $invoice->currency,
                'status' => $invoice->status->value,
                'organization' => [
                    'id' => $invoice->organization->id,
                    'name' => $invoice->organization->name,
                    'slug' => $invoice->organization->slug,
                ],
                'due_at' => $invoice->due_at?->toDateTimeString(),
                'paid_at' => $invoice->paid_at?->toDateTimeString(),
                'created_at' => $invoice->created_at->toDateTimeString(),
            ]);

        return Inertia::render('admin/invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'status' => $activeStatus,
                'search' => $search !== '' ? $search : null,
            ],
            'statuses' => array_column(InvoiceStatus::cases(), 'value'),
            'stats' => [
                'total' => Invoice::query()->count(),
                'open' => Invoice::query()->where('status', InvoiceStatus::Open)->count(),
                'overdue' => Invoice::query()->where('status', InvoiceStatus::Overdue)->count(),
                'paid' => Invoice::query()->where('status', InvoiceStatus::Paid)->count(),
                'draft' => Invoice::query()->where('status', InvoiceStatus::Draft)->count(),
                'outstanding_amount' => (int) Invoice::query()
                    ->whereIn('status', [InvoiceStatus::Open, InvoiceStatus::Overdue])
                    ->sum('amount'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/invoices/create', [
            'organizations' => Organization::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreInvoiceRequest $request, BillingService $billing): RedirectResponse
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

        return redirect()->route('admin.invoices.index')->with('success', 'Invoice created.');
    }

    public function markPaid(Invoice $invoice, BillingService $billing): RedirectResponse
    {
        $billing->markPaid($invoice);

        return back()->with('success', 'Invoice marked as paid.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Enums\CustomerStatus;
use App\Enums\LoanStatus;
use App\Http\Requests\EnableCustomerPortalRequest;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\AuditLogger;
use App\Services\CustomerIdDocumentService;
use App\Services\CustomerPhotoService;
use App\Services\CustomerPortalService;
use App\Services\ReferenceNumberGenerator;
use App\Support\CustomerFormData;
use App\Support\ListPagination;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use App\Support\Tenancy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    public function index(): Response
    {
        $photoService = app(CustomerPhotoService::class);

        $customers = Customer::query()
            ->latest()
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (Customer $customer) => [
                'id' => $customer->id,
                'reference_number' => $customer->reference_number,
                'full_name' => $customer->fullName(),
                'phone' => $customer->phone,
                'email' => $customer->email,
                'status' => $customer->status->value,
                'photo_url' => $photoService->url($customer),
            ]);

        return Inertia::render('customers/index', [
            'customers' => $customers,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customers/create', CustomerFormData::kycOptions());
    }

    public function store(
        StoreCustomerRequest $request,
        ReferenceNumberGenerator $referenceNumberGenerator,
        AuditLogger $auditLogger,
        CustomerPhotoService $customerPhotoService,
        CustomerIdDocumentService $customerIdDocumentService,
    ): RedirectResponse {
        $customer = Customer::query()->create([
            ...$this->customerAttributes($request),
            'reference_number' => $referenceNumberGenerator->generate(
                new Customer($request->only('organization_id')),
                'CUS',
            ),
            'status' => CustomerStatus::Active,
        ]);

        if ($photo = $request->file('photo')) {
            $customerPhotoService->store($customer, $photo);
        }

        $this->syncIdDocuments($customer, $request, $customerIdDocumentService);

        $auditLogger->log('customer.created', $customer);

        return redirect()->route('customers.index');
    }

    public function show(Customer $customer): Response
    {
        $organization = OrganizationContext::get();

        $loanApplications = $customer->loanApplications()
            ->with('loanProduct')
            ->latest()
            ->paginate(ListPagination::perPage(), pageName: 'applications_page')
            ->withQueryString()
            ->through(fn ($app) => [
                'id' => $app->id,
                'reference_number' => $app->reference_number,
                'product_name' => $app->loanProduct->name,
                'requested_amount' => $app->requested_amount,
                'status' => $app->status->value,
            ]);

        $loans = $customer->loans()
            ->latest()
            ->paginate(ListPagination::perPage(), pageName: 'loans_page')
            ->withQueryString()
            ->through(fn ($loan) => [
                'id' => $loan->id,
                'reference_number' => $loan->reference_number,
                'principal' => $loan->principal,
                'outstanding_balance' => $loan->outstanding_balance,
                'status' => $loan->status->value,
            ]);

        return Inertia::render('customers/show', [
            'customer' => CustomerFormData::customerPayload($customer),
            'portal' => [
                'organizationEnabled' => $organization
                    ? OrganizationPortalSettings::isEnabled($organization)
                    : false,
                'customerEnabled' => $customer->portal_enabled,
                'portalEnabledAt' => $customer->portal_enabled_at?->toDateTimeString(),
                'portalLastLoginAt' => $customer->portal_last_login_at?->toDateTimeString(),
                'loginUrl' => $organization && $customer->portal_enabled
                    ? Tenancy::organizationUrl($organization, '/portal/login')
                    : null,
            ],
            'loanApplications' => $loanApplications,
            'loans' => $loans,
            'loanStats' => [
                'applications_total' => $customer->loanApplications()->count(),
                'active_loans' => $customer->loans()
                    ->where('status', LoanStatus::Active)
                    ->count(),
                'total_outstanding' => (int) $customer->loans()
                    ->where('status', LoanStatus::Active)
                    ->sum('outstanding_balance'),
            ],
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('customers/edit', [
            'customer' => CustomerFormData::customerPayload($customer),
            'statuses' => collect(CustomerStatus::cases())->map(fn (CustomerStatus $status) => [
                'value' => $status->value,
                'label' => match ($status) {
                    CustomerStatus::Active => 'Active',
                    CustomerStatus::Inactive => 'Inactive',
                    CustomerStatus::Blacklisted => 'Blacklisted',
                },
            ])->values()->all(),
            ...CustomerFormData::kycOptions(),
        ]);
    }

    public function update(
        UpdateCustomerRequest $request,
        Customer $customer,
        AuditLogger $auditLogger,
        CustomerPhotoService $customerPhotoService,
        CustomerIdDocumentService $customerIdDocumentService,
    ): RedirectResponse {
        $old = $customer->only(['first_name', 'last_name', 'phone', 'status']);
        $customer->update($this->customerAttributes($request));
        $this->syncPhoto($customer, $request, $customerPhotoService);
        $this->syncIdDocuments($customer, $request, $customerIdDocumentService);
        $auditLogger->log('customer.updated', $customer, $old, $customer->only(['first_name', 'last_name', 'phone', 'status']));

        return redirect()->route('customers.show', $customer);
    }

    public function enablePortal(
        Customer $customer,
        EnableCustomerPortalRequest $request,
        CustomerPortalService $portal,
    ): RedirectResponse {
        $password = $request->validated('password');
        $plainPassword = $portal->enable(
            $customer,
            filled($password) ? $password : null,
        );

        return back()->with([
            'success' => 'Client portal access enabled for this customer.',
            'portal_password' => $plainPassword,
        ]);
    }

    public function disablePortal(
        Customer $customer,
        CustomerPortalService $portal,
    ): RedirectResponse {
        $portal->disable($customer);

        return back()->with('success', 'Client portal access disabled.');
    }

    public function photo(Customer $customer, CustomerPhotoService $customerPhotoService): StreamedResponse
    {
        abort_unless($customerPhotoService->exists($customer), 404);

        return Storage::disk('local')->response($customer->photo_path);
    }

    public function idFront(
        Customer $customer,
        CustomerIdDocumentService $customerIdDocumentService,
    ): StreamedResponse {
        abort_unless($customerIdDocumentService->frontExists($customer), 404);

        return Storage::disk('local')->response($customer->id_front_path);
    }

    public function idBack(
        Customer $customer,
        CustomerIdDocumentService $customerIdDocumentService,
    ): StreamedResponse {
        abort_unless($customerIdDocumentService->backExists($customer), 404);

        return Storage::disk('local')->response($customer->id_back_path);
    }

    /**
     * @return array<string, mixed>
     */
    protected function customerAttributes(FormRequest $request): array
    {
        return collect($request->validated())
            ->except([
                'photo',
                'remove_photo',
                'id_front',
                'id_back',
                'remove_id_front',
                'remove_id_back',
            ])
            ->all();
    }

    protected function syncPhoto(
        Customer $customer,
        FormRequest $request,
        CustomerPhotoService $customerPhotoService,
    ): void {
        if ($photo = $request->file('photo')) {
            $customerPhotoService->store($customer, $photo);

            return;
        }

        if ($request->boolean('remove_photo')) {
            $customerPhotoService->delete($customer);
        }
    }

    protected function syncIdDocuments(
        Customer $customer,
        FormRequest $request,
        CustomerIdDocumentService $customerIdDocumentService,
    ): void {
        if ($front = $request->file('id_front')) {
            $customerIdDocumentService->storeFront($customer, $front);
        } elseif ($request->boolean('remove_id_front')) {
            $customerIdDocumentService->deleteFront($customer);
        }

        if ($back = $request->file('id_back')) {
            $customerIdDocumentService->storeBack($customer, $back);
        } elseif ($request->boolean('remove_id_back')) {
            $customerIdDocumentService->deleteBack($customer);
        }
    }
}

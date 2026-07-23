<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CustomerStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\Api\V1\CustomerResource;
use App\Models\Customer;
use App\Services\AuditLogger;
use App\Services\CustomerIdDocumentService;
use App\Services\CustomerPhotoService;
use App\Services\ReferenceNumberGenerator;
use App\Support\ListPagination;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $customers = Customer::query()
            ->latest()
            ->paginate(ListPagination::perPage());

        return CustomerResource::collection($customers);
    }

    public function store(
        StoreCustomerRequest $request,
        ReferenceNumberGenerator $referenceNumberGenerator,
        AuditLogger $auditLogger,
        CustomerPhotoService $customerPhotoService,
        CustomerIdDocumentService $customerIdDocumentService,
    ): JsonResponse {
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

        return CustomerResource::make($customer->fresh())
            ->response()
            ->setStatusCode(201);
    }

    public function show(Customer $customer): CustomerResource
    {
        return CustomerResource::make($customer);
    }

    public function update(
        UpdateCustomerRequest $request,
        Customer $customer,
        AuditLogger $auditLogger,
        CustomerPhotoService $customerPhotoService,
        CustomerIdDocumentService $customerIdDocumentService,
    ): CustomerResource {
        $old = $customer->only(['first_name', 'last_name', 'phone', 'status']);
        $customer->update($this->customerAttributes($request));
        $this->syncPhoto($customer, $request, $customerPhotoService);
        $this->syncIdDocuments($customer, $request, $customerIdDocumentService);
        $auditLogger->log(
            'customer.updated',
            $customer,
            $old,
            $customer->only(['first_name', 'last_name', 'phone', 'status']),
        );

        return CustomerResource::make($customer->fresh());
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

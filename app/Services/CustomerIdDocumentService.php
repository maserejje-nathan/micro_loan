<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CustomerIdDocumentService
{
    private const string Disk = 'local';

    public function storeFront(Customer $customer, UploadedFile $file): void
    {
        $this->deleteFrontFile($customer);

        $customer->update([
            'id_front_path' => $this->store($customer, $file, 'id-front'),
        ]);
    }

    public function storeBack(Customer $customer, UploadedFile $file): void
    {
        $this->deleteBackFile($customer);

        $customer->update([
            'id_back_path' => $this->store($customer, $file, 'id-back'),
        ]);
    }

    public function deleteFront(Customer $customer): void
    {
        $this->deleteFrontFile($customer);
        $customer->update(['id_front_path' => null]);
    }

    public function deleteBack(Customer $customer): void
    {
        $this->deleteBackFile($customer);
        $customer->update(['id_back_path' => null]);
    }

    public function frontUrl(Customer $customer): ?string
    {
        if ($customer->id_front_path === null) {
            return null;
        }

        return route('customers.id-front', $customer);
    }

    public function backUrl(Customer $customer): ?string
    {
        if ($customer->id_back_path === null) {
            return null;
        }

        return route('customers.id-back', $customer);
    }

    public function frontExists(Customer $customer): bool
    {
        return $customer->id_front_path !== null
            && Storage::disk(self::Disk)->exists($customer->id_front_path);
    }

    public function backExists(Customer $customer): bool
    {
        return $customer->id_back_path !== null
            && Storage::disk(self::Disk)->exists($customer->id_back_path);
    }

    protected function store(Customer $customer, UploadedFile $file, string $basename): string
    {
        $directory = "organizations/{$customer->organization_id}/customers/{$customer->id}";
        $extension = $file->extension() ?: $file->guessClientExtension() ?: 'jpg';

        return $file->storeAs($directory, "{$basename}.{$extension}", self::Disk);
    }

    protected function deleteFrontFile(Customer $customer): void
    {
        if ($customer->id_front_path === null) {
            return;
        }

        Storage::disk(self::Disk)->delete($customer->id_front_path);
    }

    protected function deleteBackFile(Customer $customer): void
    {
        if ($customer->id_back_path === null) {
            return;
        }

        Storage::disk(self::Disk)->delete($customer->id_back_path);
    }
}

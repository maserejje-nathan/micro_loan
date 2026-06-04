<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CustomerPhotoService
{
    private const string Disk = 'local';

    public function store(Customer $customer, UploadedFile $file): void
    {
        $this->deleteFile($customer);

        $directory = "organizations/{$customer->organization_id}/customers/{$customer->id}";
        $extension = $file->extension() ?: $file->guessClientExtension() ?: 'jpg';
        $path = $file->storeAs($directory, "photo.{$extension}", self::Disk);

        $customer->update(['photo_path' => $path]);
    }

    public function delete(Customer $customer): void
    {
        $this->deleteFile($customer);
        $customer->update(['photo_path' => null]);
    }

    public function url(Customer $customer): ?string
    {
        if ($customer->photo_path === null) {
            return null;
        }

        return route('customers.photo', $customer);
    }

    public function portalUrl(Customer $customer): ?string
    {
        if ($customer->photo_path === null) {
            return null;
        }

        return route('portal.profile.photo');
    }

    public function exists(Customer $customer): bool
    {
        return $customer->photo_path !== null
            && Storage::disk(self::Disk)->exists($customer->photo_path);
    }

    protected function deleteFile(Customer $customer): void
    {
        if ($customer->photo_path === null) {
            return;
        }

        Storage::disk(self::Disk)->delete($customer->photo_path);
    }
}

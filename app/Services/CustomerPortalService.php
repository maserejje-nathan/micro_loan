<?php

namespace App\Services;

use App\Enums\CustomerStatus;
use App\Models\Customer;
use App\Models\Organization;
use App\Support\OrganizationPortalSettings;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use InvalidArgumentException;

class CustomerPortalService
{
    public function enable(Customer $customer, ?string $password = null): string
    {
        if ($customer->status === CustomerStatus::Blacklisted) {
            throw new InvalidArgumentException('Blacklisted customers cannot access the portal.');
        }

        $organization = $customer->organization;

        if (! OrganizationPortalSettings::isEnabled($organization)) {
            throw new InvalidArgumentException('Client portal is not enabled for this organization.');
        }

        $plainPassword = $password ?? Str::password(12);

        $customer->forceFill([
            'portal_enabled' => true,
            'portal_password' => Hash::make($plainPassword),
            'portal_enabled_at' => now(),
        ])->save();

        return $plainPassword;
    }

    public function disable(Customer $customer): void
    {
        $customer->forceFill([
            'portal_enabled' => false,
            'portal_password' => null,
            'portal_enabled_at' => null,
            'portal_last_login_at' => null,
        ])->save();
    }

    public function resetPassword(Customer $customer, string $password): void
    {
        if (! $customer->portal_enabled) {
            throw new InvalidArgumentException('Portal access is not enabled for this customer.');
        }

        $customer->forceFill([
            'portal_password' => Hash::make($password),
        ])->save();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function register(Organization $organization, array $attributes, string $password): Customer
    {
        if (! OrganizationPortalSettings::allowsSelfRegistration($organization)) {
            throw new InvalidArgumentException('Self-registration is not enabled for this organization.');
        }

        $phone = $this->normalizePhone((string) ($attributes['phone'] ?? ''));

        if ($this->phoneExists($organization, $phone)) {
            throw new InvalidArgumentException('A customer with this phone number already exists.');
        }

        return DB::transaction(function () use ($organization, $attributes, $password, $phone) {
            $customer = Customer::query()->create([
                ...$attributes,
                'organization_id' => $organization->id,
                'phone' => $phone,
                'reference_number' => app(ReferenceNumberGenerator::class)->generate(
                    new Customer(['organization_id' => $organization->id]),
                    'CUS',
                ),
                'status' => CustomerStatus::Active,
                'portal_enabled' => true,
                'portal_password' => Hash::make($password),
                'portal_enabled_at' => now(),
            ]);

            return $customer;
        });
    }

    public function phoneExists(Organization $organization, string $phone): bool
    {
        $normalized = $this->normalizePhone($phone);

        return Customer::query()
            ->withoutGlobalScopes()
            ->where('organization_id', $organization->id)
            ->where(function ($query) use ($phone, $normalized) {
                $query->where('phone', $phone)
                    ->orWhere('phone', $normalized);
            })
            ->exists();
    }

    public function findForLogin(Organization $organization, string $phone): ?Customer
    {
        $normalized = $this->normalizePhone($phone);

        return Customer::query()
            ->withoutGlobalScopes()
            ->where('organization_id', $organization->id)
            ->where('portal_enabled', true)
            ->where(function ($query) use ($phone, $normalized) {
                $query->where('phone', $phone)
                    ->orWhere('phone', $normalized);
            })
            ->where('status', '!=', CustomerStatus::Blacklisted)
            ->first();
    }

    public function normalizePhone(string $phone): string
    {
        return preg_replace('/\s+/', '', $phone) ?? $phone;
    }
}

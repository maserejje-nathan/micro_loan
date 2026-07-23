<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\HasDatabaseNotifications;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'current_organization_id', 'is_super_admin'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasDatabaseNotifications, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_super_admin' => 'boolean',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return (bool) $this->is_super_admin;
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function currentOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'current_organization_id');
    }

    /**
     * @return BelongsToMany<Organization, $this>
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class)
            ->withPivot('role_id')
            ->withTimestamps()
            ->using(OrganizationUser::class);
    }

    public function roleInOrganization(?Organization $organization = null): ?Role
    {
        $organization ??= $this->currentOrganization;

        if ($organization === null) {
            return null;
        }

        $pivot = $this->organizations()
            ->where('organizations.id', $organization->id)
            ->first()
            ?->pivot;

        if ($pivot === null) {
            return null;
        }

        return Role::query()->find($pivot->role_id);
    }

    public function hasPermission(string $permission, ?Organization $organization = null): bool
    {
        $role = $this->roleInOrganization($organization);

        return $role?->hasPermission($permission) ?? false;
    }

    public function switchOrganization(Organization $organization): void
    {
        if (! $this->organizations()->where('organizations.id', $organization->id)->exists()) {
            return;
        }

        $this->forceFill(['current_organization_id' => $organization->id])->save();
    }
}

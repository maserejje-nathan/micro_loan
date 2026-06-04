<?php

namespace App\Services;

use App\Enums\PermissionName;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Collection;

class OrganizationSetupService
{
    public function createForUser(User $user, string $organizationName): Organization
    {
        $this->seedPermissions();

        $slug = Organization::generateSlug($organizationName);

        $organization = Organization::query()->create([
            'name' => $organizationName,
            'slug' => $slug,
            'subdomain' => $slug,
            'email' => $user->email,
        ]);

        $this->seedRoles($organization);

        $ownerRole = $organization->roles()->where('slug', 'owner')->firstOrFail();

        $organization->users()->attach($user->id, ['role_id' => $ownerRole->id]);
        $user->switchOrganization($organization);

        app(SubscriptionService::class)->startTrial($organization);

        return $organization;
    }

    public function seedPermissions(): void
    {
        foreach (PermissionName::cases() as $permission) {
            Permission::query()->updateOrCreate(
                ['name' => $permission->value],
                [
                    'label' => $permission->label(),
                    'group' => $permission->group(),
                ],
            );
        }
    }

    public function seedRoles(Organization $organization): void
    {
        $allPermissionIds = Permission::query()->pluck('id');

        $roles = [
            'owner' => $allPermissionIds,
            'manager' => Permission::query()
                ->whereNotIn('name', [
                    PermissionName::SettingsManage->value,
                    PermissionName::UsersManage->value,
                ])
                ->pluck('id'),
            'loan_officer' => Permission::query()
                ->whereIn('name', [
                    PermissionName::DashboardView->value,
                    PermissionName::CustomersView->value,
                    PermissionName::CustomersManage->value,
                    PermissionName::ApplicationsView->value,
                    PermissionName::ApplicationsManage->value,
                    PermissionName::LoansView->value,
                    PermissionName::RepaymentsView->value,
                    PermissionName::RepaymentsManage->value,
                ])
                ->pluck('id'),
            'cashier' => Permission::query()
                ->whereIn('name', [
                    PermissionName::DashboardView->value,
                    PermissionName::CustomersView->value,
                    PermissionName::LoansView->value,
                    PermissionName::RepaymentsView->value,
                    PermissionName::RepaymentsManage->value,
                    PermissionName::LoansDisburse->value,
                ])
                ->pluck('id'),
            'viewer' => Permission::query()
                ->where('name', 'like', '%.view')
                ->pluck('id'),
        ];

        foreach ($roles as $slug => $permissionIds) {
            $role = Role::query()->create([
                'organization_id' => $organization->id,
                'name' => str($slug)->replace('_', ' ')->title()->toString(),
                'slug' => $slug,
                'is_system' => true,
            ]);

            $role->permissions()->sync($permissionIds);
        }
    }

    /**
     * @return Collection<int, Role>
     */
    public function rolesFor(Organization $organization): Collection
    {
        return $organization->roles()->orderBy('name')->get();
    }
}

<?php

namespace Tests\Support;

use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\OrganizationSetupService;
use Database\Seeders\SubscriptionPlanSeeder;

trait ActsAsOrganization
{
    protected function setupOrganization(User $user, ?string $name = null): Organization
    {
        $setup = app(OrganizationSetupService::class);
        $setup->seedPermissions();

        if (SubscriptionPlan::query()->doesntExist()) {
            $this->seed(SubscriptionPlanSeeder::class);
        }

        return $setup->createForUser($user, $name ?? 'Test Lending Co');
    }
}

<?php

namespace App\Support;

use App\Models\Organization;

class OrganizationPortalSettings
{
    /**
     * @return array{
     *     enabled: bool,
     *     allow_applications: bool,
     *     allow_self_registration: bool,
     *     welcome_message: string
     * }
     */
    public static function for(Organization $organization): array
    {
        /** @var array<string, mixed> $settings */
        $settings = $organization->settings ?? [];
        /** @var array<string, mixed> $portal */
        $portal = $settings['portal'] ?? [];

        return [
            'enabled' => (bool) ($portal['enabled'] ?? false),
            'allow_applications' => (bool) ($portal['allow_applications'] ?? true),
            'allow_self_registration' => (bool) ($portal['allow_self_registration'] ?? false),
            'welcome_message' => (string) ($portal['welcome_message'] ?? ''),
        ];
    }

    public static function isEnabled(Organization $organization): bool
    {
        return self::for($organization)['enabled'];
    }

    public static function allowsSelfRegistration(Organization $organization): bool
    {
        $portal = self::for($organization);

        return $portal['enabled'] && $portal['allow_self_registration'];
    }

    /**
     * @param  array{
     *     enabled?: bool,
     *     allow_applications?: bool,
     *     allow_self_registration?: bool,
     *     welcome_message?: string
     * }  $portal
     */
    public static function merge(Organization $organization, array $portal): void
    {
        $settings = $organization->settings ?? [];
        $current = $settings['portal'] ?? [];

        $settings['portal'] = array_merge($current, $portal);
        $organization->forceFill(['settings' => $settings])->save();
    }
}

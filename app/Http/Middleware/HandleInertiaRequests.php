<?php

namespace App\Http\Middleware;

use App\Services\CustomerPhotoService;
use App\Services\InAppNotificationService;
use App\Services\PlatformLogoService;
use App\Services\PlatformSettingsService;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use App\Support\Tenancy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $portalCustomer = $request->user('portal');

        if ($portalCustomer !== null && $request->routeIs('portal.*')) {
            $organization = $portalCustomer->organization
                ?? OrganizationContext::get();

            return [
                ...parent::share($request),
                ...$this->branding(),
                'name' => $organization?->name ?? config('app.name'),
                'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
                'auth' => [
                    'customer' => [
                        'id' => $portalCustomer->id,
                        'name' => $portalCustomer->fullName(),
                        'phone' => $portalCustomer->phone,
                        'photo_url' => app(CustomerPhotoService::class)->portalUrl($portalCustomer),
                    ],
                    'organization' => $organization ? [
                        'id' => $organization->id,
                        'name' => $organization->name,
                        'slug' => $organization->slug,
                        'currency' => $organization->currency,
                    ] : null,
                ],
                'tenancy' => [
                    'subdomain_enabled' => Tenancy::isEnabled(),
                ],
                'portalSettings' => $organization
                    ? OrganizationPortalSettings::for($organization)
                    : [
                        'enabled' => false,
                        'allow_applications' => false,
                        'allow_self_registration' => false,
                        'welcome_message' => '',
                    ],
                'flash' => [
                    'success' => fn () => $request->session()->get('success'),
                    'error' => fn () => $request->session()->get('error'),
                    'portal_password' => fn () => $request->session()->get('portal_password'),
                    'integration_response' => fn () => $request->session()->get('integration_response'),
                ],
            ];
        }

        $user = $request->user('web');
        $organization = $user?->currentOrganization
            ?? OrganizationContext::get();
        $role = $user?->roleInOrganization($organization);

        return [
            ...parent::share($request),
            ...$this->branding(),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'isSuperAdmin' => (bool) $user?->is_super_admin,
                'organization' => $organization ? [
                    'id' => $organization->id,
                    'name' => $organization->name,
                    'slug' => $organization->slug,
                    'currency' => $organization->currency,
                ] : null,
                'role' => $role ? [
                    'name' => $role->name,
                    'slug' => $role->slug,
                ] : null,
                'permissions' => $role
                    ? $role->permissions()->pluck('name')->all()
                    : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'warning' => fn () => $request->session()->get('warning'),
                'error' => fn () => $request->session()->get('error'),
                'portal_password' => fn () => $request->session()->get('portal_password'),
                'integration_response' => fn () => $request->session()->get('integration_response'),
            ],
            'tenancy' => [
                'subdomain_enabled' => Tenancy::isEnabled(),
                'base_domain' => Tenancy::baseDomain(),
            ],
            'notifications' => fn () => $user && Schema::hasTable('notifications')
                ? [
                    'unreadCount' => app(InAppNotificationService::class)
                        ->unreadCountFor($user),
                    'recent' => app(InAppNotificationService::class)
                        ->recentFor($user),
                ]
                : ['unreadCount' => 0, 'recent' => []],
        ];
    }

    /**
     * @return array{logoUrl: string|null}
     */
    protected function branding(): array
    {
        $welcome = app(PlatformSettingsService::class)->welcome();

        return [
            'logoUrl' => app(PlatformLogoService::class)->resolve($welcome),
        ];
    }
}

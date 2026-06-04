<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePortalSettingsRequest;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use App\Support\Tenancy;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PortalSettingsController extends Controller
{
    public function edit(): Response
    {
        $organization = OrganizationContext::get();
        abort_if($organization === null, 403);

        $portal = OrganizationPortalSettings::for($organization);

        return Inertia::render('settings/portal', [
            'portal' => $portal,
            'portalLoginUrl' => Tenancy::organizationUrl($organization, '/portal/login'),
            'portalRegisterUrl' => OrganizationPortalSettings::allowsSelfRegistration($organization)
                ? Tenancy::organizationUrl($organization, '/portal/register')
                : null,
            'organization' => [
                'name' => $organization->name,
                'slug' => $organization->slug,
            ],
        ]);
    }

    public function update(UpdatePortalSettingsRequest $request): RedirectResponse
    {
        $organization = OrganizationContext::get();
        abort_if($organization === null, 403);

        OrganizationPortalSettings::merge($organization, [
            'enabled' => $request->boolean('enabled'),
            'allow_applications' => $request->boolean('allow_applications'),
            'allow_self_registration' => $request->boolean('allow_self_registration'),
            'welcome_message' => $request->string('welcome_message')->toString(),
        ]);

        return back()->with('success', 'Client portal settings saved.');
    }
}

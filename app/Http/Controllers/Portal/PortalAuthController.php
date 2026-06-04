<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\PortalLoginRequest;
use App\Models\Organization;
use App\Services\CustomerPortalService;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use App\Support\Tenancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PortalAuthController extends Controller
{
    public function create(Request $request): Response
    {
        $organization = OrganizationContext::get();

        return Inertia::render('portal/login', [
            'organization' => $organization ? [
                'name' => $organization->name,
                'slug' => $organization->slug,
            ] : null,
            'requiresOrganizationSlug' => $organization === null && ! Tenancy::isEnabled(),
            'portalLoginUrl' => $organization
                ? Tenancy::organizationUrl($organization, '/portal/login')
                : null,
            'allowSelfRegistration' => $organization
                ? OrganizationPortalSettings::allowsSelfRegistration($organization)
                : false,
            'portalRegisterUrl' => $organization
                ? Tenancy::organizationUrl($organization, '/portal/register')
                : null,
        ]);
    }

    public function store(PortalLoginRequest $request, CustomerPortalService $portal): RedirectResponse
    {
        $organization = OrganizationContext::get();

        if ($organization === null && $request->filled('organization_slug')) {
            $organization = Organization::query()
                ->where('slug', $request->string('organization_slug')->toString())
                ->first();
        }

        if ($organization === null) {
            return back()->withErrors([
                'organization_slug' => 'Enter your lender code to sign in.',
            ]);
        }

        if (! OrganizationPortalSettings::isEnabled($organization)) {
            return back()->withErrors([
                'phone' => 'The client portal is not available for this lender.',
            ]);
        }

        OrganizationContext::set($organization);
        $request->session()->put('portal_organization_id', $organization->id);

        $customer = $portal->findForLogin($organization, $request->string('phone')->toString());

        if ($customer === null || ! Hash::check($request->string('password')->toString(), $customer->portal_password)) {
            return back()->withErrors([
                'phone' => 'These credentials do not match our records.',
            ]);
        }

        Auth::guard('portal')->login($customer, $request->boolean('remember'));
        $request->session()->regenerate();

        $customer->forceFill(['portal_last_login_at' => now()])->save();

        return redirect()->intended(route('portal.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('portal')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('portal.login');
    }
}

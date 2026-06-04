<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\PortalRegisterRequest;
use App\Models\Organization;
use App\Services\CustomerIdDocumentService;
use App\Services\CustomerPortalService;
use App\Support\CustomerFormData;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use App\Support\Tenancy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PortalRegistrationController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $organization = OrganizationContext::get();

        if ($organization === null) {
            return Inertia::render('portal/register', [
                'organization' => null,
                'requiresOrganizationSlug' => ! Tenancy::isEnabled(),
                'allowSelfRegistration' => false,
                ...CustomerFormData::kycOptions(),
            ]);
        }

        if (! OrganizationPortalSettings::allowsSelfRegistration($organization)) {
            return redirect()
                ->route('portal.login')
                ->with('error', 'Self-registration is not available. Contact your lender for portal access.');
        }

        return Inertia::render('portal/register', [
            'organization' => [
                'name' => $organization->name,
                'slug' => $organization->slug,
                'currency' => $organization->currency,
            ],
            'requiresOrganizationSlug' => false,
            'allowSelfRegistration' => true,
            'portalLoginUrl' => Tenancy::organizationUrl($organization, '/portal/login'),
            ...CustomerFormData::kycOptions(),
        ]);
    }

    public function store(
        PortalRegisterRequest $request,
        CustomerPortalService $portal,
        CustomerIdDocumentService $customerIdDocumentService,
    ): RedirectResponse {
        $organization = OrganizationContext::get();

        if ($organization === null && $request->filled('organization_slug')) {
            $organization = Organization::query()
                ->where('slug', $request->string('organization_slug')->toString())
                ->first();
        }

        if ($organization === null) {
            return back()->withErrors([
                'organization_slug' => 'Enter your lender code to create an account.',
            ]);
        }

        if (! OrganizationPortalSettings::isEnabled($organization)) {
            return back()->withErrors([
                'phone' => 'The client portal is not available for this lender.',
            ]);
        }

        if (! OrganizationPortalSettings::allowsSelfRegistration($organization)) {
            abort(HttpResponse::HTTP_FORBIDDEN, 'Self-registration is not enabled for this lender.');
        }

        OrganizationContext::set($organization);
        $request->session()->put('portal_organization_id', $organization->id);

        $customer = $portal->register(
            $organization,
            $request->safe()->except([
                'organization_slug',
                'password',
                'password_confirmation',
                'id_front',
                'id_back',
            ]),
            $request->string('password')->toString(),
        );

        if ($front = $request->file('id_front')) {
            $customerIdDocumentService->storeFront($customer, $front);
        }

        if ($back = $request->file('id_back')) {
            $customerIdDocumentService->storeBack($customer, $back);
        }

        Auth::guard('portal')->login($customer);
        $request->session()->regenerate();

        $customer->forceFill(['portal_last_login_at' => now()])->save();

        return redirect()
            ->route('portal.dashboard')
            ->with('success', 'Welcome! Your account has been created.');
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use App\Support\OrganizationContext;
use App\Support\Tenancy;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetPortalOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        OrganizationContext::clear();

        $organization = Tenancy::resolveOrganization($request);

        if ($organization === null && $request->filled('organization_slug')) {
            $organization = Organization::query()
                ->where('slug', $request->string('organization_slug')->toString())
                ->first();
        }

        if (
            $organization === null
            && $request->hasSession()
            && $request->session()->has('portal_organization_id')
        ) {
            $organization = Organization::query()->find(
                (int) $request->session()->get('portal_organization_id'),
            );
        }

        $portalCustomer = auth('portal')->user();

        if ($organization === null && $portalCustomer !== null) {
            $organization = $portalCustomer->organization;
        }

        if ($organization !== null) {
            OrganizationContext::set($organization);

            if ($request->hasSession()) {
                $request->session()->put('portal_organization_id', $organization->id);
            }
        }

        return $next($request);
    }
}

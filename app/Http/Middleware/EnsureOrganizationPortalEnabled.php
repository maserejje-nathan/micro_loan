<?php

namespace App\Http\Middleware;

use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationPortalEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $organization = OrganizationContext::get();

        if ($organization === null) {
            if ($request->routeIs('portal.login', 'portal.login.store', 'portal.register', 'portal.register.store')) {
                return $next($request);
            }

            abort(404, 'Organization not found. Use your lender portal URL to sign in.');
        }

        if (! OrganizationPortalSettings::isEnabled($organization)) {
            abort(403, 'The client portal is not enabled for this organization.');
        }

        return $next($request);
    }
}

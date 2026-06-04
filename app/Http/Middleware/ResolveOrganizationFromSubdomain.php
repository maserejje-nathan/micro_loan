<?php

namespace App\Http\Middleware;

use App\Support\OrganizationContext;
use App\Support\Tenancy;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveOrganizationFromSubdomain
{
    public function handle(Request $request, Closure $next): Response
    {
        $organization = Tenancy::resolveOrganization($request);

        if ($organization !== null) {
            OrganizationContext::set($organization);
            $request->attributes->set('tenant_organization', $organization);

            $user = $request->user();
            if ($user !== null && $user->organizations()->where('organizations.id', $organization->id)->exists()) {
                if ($user->current_organization_id !== $organization->id) {
                    $user->forceFill(['current_organization_id' => $organization->id])->save();
                }
            }
        }

        return $next($request);
    }
}

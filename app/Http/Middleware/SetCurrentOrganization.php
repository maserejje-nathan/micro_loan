<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        if (OrganizationContext::get() !== null) {
            return $next($request);
        }

        $user = $request->user();

        if ($user instanceof User && $user->current_organization_id !== null) {
            $user->loadMissing('currentOrganization');
            OrganizationContext::set($user->currentOrganization);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use App\Support\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetOrganizationFromPortalCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof Customer) {
            $user->loadMissing('organization');
            OrganizationContext::set($user->organization);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->isSuperAdmin()) {
            return $next($request);
        }

        if ($user === null || $user->current_organization_id === null) {
            if ($request->expectsJson()) {
                abort(403, 'Organization workspace required.');
            }

            return redirect()->route('onboarding.organization');
        }

        return $next($request);
    }
}

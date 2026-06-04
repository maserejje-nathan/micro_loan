<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfPortalCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth('portal')->check()) {
            return redirect()->route('portal.dashboard');
        }

        return $next($request);
    }
}

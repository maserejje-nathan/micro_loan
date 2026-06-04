<?php

namespace App\Http\Middleware;

use App\Support\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveSubscription
{
    /**
     * @var list<string>
     */
    protected array $except = [
        'settings.billing',
        'onboarding.organization',
        'onboarding.organization.store',
        'logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isSuperAdmin()) {
            return $next($request);
        }

        if (in_array($request->route()?->getName(), $this->except, true)) {
            return $next($request);
        }

        $organization = OrganizationContext::get();
        $subscription = $organization?->activeSubscription();

        if ($subscription !== null && $subscription->isUsable()) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            abort(402, 'An active subscription is required.');
        }

        return redirect()
            ->route('settings.billing.index')
            ->with('error', 'Your subscription is inactive or expired. Please update billing to continue.');
    }
}

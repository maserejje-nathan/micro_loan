<?php

use App\Http\Middleware\EnsureActiveSubscription;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureUserHasOrganization;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ResolveOrganizationFromSubdomain;
use App\Http\Middleware\SetCurrentOrganization;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/portal.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'org' => EnsureUserHasOrganization::class,
            'permission' => EnsurePermission::class,
            'super_admin' => EnsureSuperAdmin::class,
            'subscription.active' => EnsureActiveSubscription::class,
        ]);

        $middleware->web(prepend: [
            ResolveOrganizationFromSubdomain::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            SetCurrentOrganization::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('loans:process-overdue')->dailyAt('08:00');
    })
    ->create();

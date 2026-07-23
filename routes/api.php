<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Middleware\EnsureActiveSubscription;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureUserHasOrganization;
use App\Http\Middleware\SetCurrentOrganization;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::post('login', [AuthController::class, 'store'])
        ->middleware('throttle:api-login')
        ->name('login');

    Route::middleware(['auth:sanctum', SetCurrentOrganization::class])->group(function () {
        Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
        Route::get('me', MeController::class)->name('me');

        Route::middleware([
            EnsureUserHasOrganization::class,
            EnsureActiveSubscription::class,
        ])->group(function () {
            Route::get('dashboard', DashboardController::class)
                ->middleware(EnsurePermission::class.':dashboard.view')
                ->name('dashboard');
        });
    });
});

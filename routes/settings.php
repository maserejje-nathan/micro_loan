<?php

use App\Http\Controllers\Settings\PortalSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\TeamInvitationController;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureUserHasOrganization;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::middleware([EnsureUserHasOrganization::class, EnsurePermission::class.':users.manage'])
        ->prefix('settings/team')
        ->name('settings.team.')
        ->group(function () {
            Route::get('/', [TeamInvitationController::class, 'index'])->name('index');
            Route::post('/', [TeamInvitationController::class, 'store'])->name('store');
            Route::delete('{invitation}', [TeamInvitationController::class, 'destroy'])->name('destroy');
        });

    Route::middleware([EnsureUserHasOrganization::class, EnsurePermission::class.':settings.manage'])
        ->prefix('settings/portal')
        ->name('settings.portal.')
        ->group(function () {
            Route::get('/', [PortalSettingsController::class, 'edit'])->name('edit');
            Route::put('/', [PortalSettingsController::class, 'update'])->name('update');
        });
});

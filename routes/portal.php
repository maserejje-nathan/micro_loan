<?php

use App\Http\Controllers\Portal\PortalAuthController;
use App\Http\Controllers\Portal\PortalDashboardController;
use App\Http\Controllers\Portal\PortalLoanApplicationController;
use App\Http\Controllers\Portal\PortalLoanController;
use App\Http\Controllers\Portal\PortalProfileController;
use App\Http\Controllers\Portal\PortalRegistrationController;
use App\Http\Middleware\EnsureOrganizationPortalEnabled;
use App\Http\Middleware\RedirectIfPortalCustomer;
use App\Http\Middleware\SetPortalOrganization;
use Illuminate\Support\Facades\Route;

Route::prefix('portal')
    ->name('portal.')
    ->middleware([SetPortalOrganization::class])
    ->group(function () {
        Route::middleware([RedirectIfPortalCustomer::class, EnsureOrganizationPortalEnabled::class])->group(function () {
            Route::get('login', [PortalAuthController::class, 'create'])->name('login');
            Route::post('login', [PortalAuthController::class, 'store'])->name('login.store');
            Route::get('register', [PortalRegistrationController::class, 'create'])->name('register');
            Route::post('register', [PortalRegistrationController::class, 'store'])->name('register.store');
        });

        Route::middleware(['auth:portal', EnsureOrganizationPortalEnabled::class])->group(function () {
            Route::post('logout', [PortalAuthController::class, 'destroy'])->name('logout');

            Route::get('/', PortalDashboardController::class)->name('dashboard');

            Route::get('loans', [PortalLoanController::class, 'index'])->name('loans.index');
            Route::get('loans/{loan}', [PortalLoanController::class, 'show'])->name('loans.show');
            Route::get('loans/{loan}/statement', [PortalLoanController::class, 'statement'])->name('loans.statement');

            Route::get('applications', [PortalLoanApplicationController::class, 'index'])->name('applications.index');
            Route::get('applications/{loan_application}', [PortalLoanApplicationController::class, 'show'])->name('applications.show');
            Route::get('applications/create/new', [PortalLoanApplicationController::class, 'create'])->name('applications.create');
            Route::post('applications', [PortalLoanApplicationController::class, 'store'])->name('applications.store');
            Route::post('applications/{loan_application}/submit', [PortalLoanApplicationController::class, 'submit'])
                ->name('applications.submit');

            Route::get('profile/photo', [PortalProfileController::class, 'photo'])->name('profile.photo');
            Route::get('profile', [PortalProfileController::class, 'edit'])->name('profile.edit');
            Route::put('profile', [PortalProfileController::class, 'update'])->name('profile.update');
            Route::put('profile/password', [PortalProfileController::class, 'updatePassword'])->name('profile.password');
            Route::put('profile/notification-preferences', [PortalProfileController::class, 'updateNotificationPreferences'])
                ->name('profile.notification-preferences');
        });
    });

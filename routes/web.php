<?php

use App\Http\Controllers\AcceptTeamInvitationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanApplicationController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\LoanProductController;
use App\Http\Controllers\LoanStatementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingOrganizationController;
use App\Http\Controllers\RepaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Settings\BillingController;
use App\Http\Controllers\WelcomeController;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureUserHasOrganization;
use Illuminate\Support\Facades\Route;

Route::get('/', WelcomeController::class)->name('home');

Route::get('invitations/{token}', [AcceptTeamInvitationController::class, 'show'])
    ->name('invitations.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.read-all');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');

    Route::post('invitations/{token}/accept', [AcceptTeamInvitationController::class, 'accept'])
        ->name('invitations.accept');

    Route::get('onboarding/organization', [OnboardingOrganizationController::class, 'create'])
        ->name('onboarding.organization');
    Route::post('onboarding/organization', [OnboardingOrganizationController::class, 'store'])
        ->name('onboarding.organization.store');

    Route::middleware(['auth', 'verified', 'super_admin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(base_path('routes/admin.php'));

    Route::middleware([EnsureUserHasOrganization::class, 'subscription.active'])->group(function () {
        Route::get('dashboard', DashboardController::class)
            ->middleware(EnsurePermission::class.':dashboard.view')
            ->name('dashboard');

        Route::get('customers/{customer}/photo', [CustomerController::class, 'photo'])
            ->name('customers.photo');
        Route::get('customers/{customer}/id-front', [CustomerController::class, 'idFront'])
            ->name('customers.id-front');
        Route::get('customers/{customer}/id-back', [CustomerController::class, 'idBack'])
            ->name('customers.id-back');
        Route::post('customers/{customer}/portal/enable', [CustomerController::class, 'enablePortal'])
            ->middleware(EnsurePermission::class.':customers.manage')
            ->name('customers.portal.enable');
        Route::post('customers/{customer}/portal/disable', [CustomerController::class, 'disablePortal'])
            ->middleware(EnsurePermission::class.':customers.manage')
            ->name('customers.portal.disable');
        Route::resource('customers', CustomerController::class)
            ->middleware(EnsurePermission::class.':customers.view');

        Route::resource('loan-products', LoanProductController::class)
            ->middleware(EnsurePermission::class.':loan_products.view');

        Route::resource('loan-applications', LoanApplicationController::class)
            ->only(['index', 'create', 'store', 'show'])
            ->middleware(EnsurePermission::class.':loan_applications.view');
        Route::post('loan-applications/{loan_application}/submit', [LoanApplicationController::class, 'submit'])
            ->name('loan-applications.submit');
        Route::post('loan-applications/{loan_application}/approve', [LoanApplicationController::class, 'approve'])
            ->name('loan-applications.approve');
        Route::post('loan-applications/{loan_application}/reject', [LoanApplicationController::class, 'reject'])
            ->name('loan-applications.reject');

        Route::resource('loans', LoanController::class)
            ->only(['index', 'show'])
            ->middleware(EnsurePermission::class.':loans.view');
        Route::post('loans/{loan}/disburse', [LoanController::class, 'disburse'])
            ->name('loans.disburse');
        Route::get('loans/{loan}/statement', LoanStatementController::class)
            ->name('loans.statement');
        Route::post('loans/{loan}/schedules/{schedule}/payment-reminder', [LoanController::class, 'sendPaymentReminder'])
            ->name('loans.schedules.payment-reminder');

        Route::resource('repayments', RepaymentController::class)
            ->only(['index', 'create', 'store'])
            ->middleware(EnsurePermission::class.':repayments.view');

        Route::get('reports', [ReportController::class, 'index'])
            ->middleware(EnsurePermission::class.':reports.view')
            ->name('reports.index');

        Route::get('audit-logs', [AuditLogController::class, 'index'])
            ->middleware(EnsurePermission::class.':audit_logs.view')
            ->name('audit-logs.index');
    });

    Route::middleware([EnsureUserHasOrganization::class])->group(function () {
        Route::get('settings/billing', [BillingController::class, 'index'])
            ->name('settings.billing.index');
    });
});

require __DIR__.'/settings.php';

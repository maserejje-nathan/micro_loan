<?php

use App\Http\Controllers\Api\V1\Admin\InvoiceController as AdminInvoiceController;
use App\Http\Controllers\Api\V1\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Api\V1\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Api\V1\Admin\SystemController as AdminSystemController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\LoanApplicationController;
use App\Http\Controllers\Api\V1\LoanController;
use App\Http\Controllers\Api\V1\LoanProductController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\Portal\ApplicationController as PortalApplicationController;
use App\Http\Controllers\Api\V1\Portal\AuthController as PortalAuthController;
use App\Http\Controllers\Api\V1\Portal\DashboardController as PortalDashboardController;
use App\Http\Controllers\Api\V1\Portal\LoanController as PortalLoanController;
use App\Http\Controllers\Api\V1\Portal\MeController as PortalMeController;
use App\Http\Controllers\Api\V1\Portal\ProfileController as PortalProfileController;
use App\Http\Controllers\Api\V1\RepaymentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Middleware\EnsureActiveSubscription;
use App\Http\Middleware\EnsureApiPortalCustomer;
use App\Http\Middleware\EnsureApiStaffUser;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureUserHasOrganization;
use App\Http\Middleware\SetCurrentOrganization;
use App\Http\Middleware\SetOrganizationFromPortalCustomer;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::post('login', [AuthController::class, 'store'])
        ->middleware('throttle:api-login')
        ->name('login');

    Route::post('portal/login', [PortalAuthController::class, 'store'])
        ->middleware('throttle:portal-api-login')
        ->name('portal.login');

    Route::middleware([
        'auth:sanctum',
        EnsureApiStaffUser::class,
        SetCurrentOrganization::class,
    ])->group(function () {
        Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
        Route::get('me', MeController::class)->name('me');

        Route::middleware(['super_admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::get('dashboard', DashboardController::class)->name('dashboard');

            Route::get('organizations', [AdminOrganizationController::class, 'index'])->name('organizations.index');
            Route::get('organizations/{organization}', [AdminOrganizationController::class, 'show'])->name('organizations.show');

            Route::get('plans', [AdminPlanController::class, 'index'])->name('plans.index');
            Route::get('plans/{plan}', [AdminPlanController::class, 'show'])->name('plans.show');

            Route::get('subscriptions', [AdminSubscriptionController::class, 'index'])->name('subscriptions.index');
            Route::post('subscriptions/{subscription}/cancel', [AdminSubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
            Route::post('subscriptions/{subscription}/activate', [AdminSubscriptionController::class, 'activate'])->name('subscriptions.activate');
            Route::post('subscriptions/{subscription}/renew', [AdminSubscriptionController::class, 'renew'])->name('subscriptions.renew');

            Route::get('invoices', [AdminInvoiceController::class, 'index'])->name('invoices.index');
            Route::post('invoices', [AdminInvoiceController::class, 'store'])->name('invoices.store');
            Route::post('invoices/{invoice}/paid', [AdminInvoiceController::class, 'markPaid'])->name('invoices.paid');

            Route::get('system', AdminSystemController::class)->name('system');
        });

        Route::middleware([
            EnsureUserHasOrganization::class,
            EnsureActiveSubscription::class,
        ])->group(function () {
            Route::get('dashboard', DashboardController::class)
                ->middleware(EnsurePermission::class.':dashboard.view')
                ->name('dashboard');

            Route::get('customers', [CustomerController::class, 'index'])
                ->middleware(EnsurePermission::class.':customers.view')
                ->name('customers.index');
            Route::post('customers', [CustomerController::class, 'store'])
                ->middleware(EnsurePermission::class.':customers.manage')
                ->name('customers.store');
            Route::get('customers/{customer}', [CustomerController::class, 'show'])
                ->middleware(EnsurePermission::class.':customers.view')
                ->name('customers.show');
            Route::put('customers/{customer}', [CustomerController::class, 'update'])
                ->middleware(EnsurePermission::class.':customers.manage')
                ->name('customers.update');

            Route::get('loan-products', [LoanProductController::class, 'index'])
                ->middleware(EnsurePermission::class.':loan_products.view')
                ->name('loan-products.index');
            Route::post('loan-products', [LoanProductController::class, 'store'])
                ->middleware(EnsurePermission::class.':loan_products.manage')
                ->name('loan-products.store');
            Route::get('loan-products/{loan_product}', [LoanProductController::class, 'show'])
                ->middleware(EnsurePermission::class.':loan_products.view')
                ->name('loan-products.show');
            Route::put('loan-products/{loan_product}', [LoanProductController::class, 'update'])
                ->middleware(EnsurePermission::class.':loan_products.manage')
                ->name('loan-products.update');

            Route::get('loan-applications', [LoanApplicationController::class, 'index'])
                ->middleware(EnsurePermission::class.':loan_applications.view')
                ->name('loan-applications.index');
            Route::post('loan-applications', [LoanApplicationController::class, 'store'])
                ->middleware(EnsurePermission::class.':loan_applications.manage')
                ->name('loan-applications.store');
            Route::get('loan-applications/{loan_application}', [LoanApplicationController::class, 'show'])
                ->middleware(EnsurePermission::class.':loan_applications.view')
                ->name('loan-applications.show');
            Route::post('loan-applications/{loan_application}/submit', [LoanApplicationController::class, 'submit'])
                ->middleware(EnsurePermission::class.':loan_applications.manage')
                ->name('loan-applications.submit');
            Route::post('loan-applications/{loan_application}/approve', [LoanApplicationController::class, 'approve'])
                ->middleware(EnsurePermission::class.':loan_applications.approve')
                ->name('loan-applications.approve');
            Route::post('loan-applications/{loan_application}/reject', [LoanApplicationController::class, 'reject'])
                ->middleware(EnsurePermission::class.':loan_applications.approve')
                ->name('loan-applications.reject');

            Route::get('loans', [LoanController::class, 'index'])
                ->middleware(EnsurePermission::class.':loans.view')
                ->name('loans.index');
            Route::get('loans/{loan}', [LoanController::class, 'show'])
                ->middleware(EnsurePermission::class.':loans.view')
                ->name('loans.show');
            Route::post('loans/{loan}/disburse', [LoanController::class, 'disburse'])
                ->middleware(EnsurePermission::class.':loans.disburse')
                ->name('loans.disburse');

            Route::get('repayments', [RepaymentController::class, 'index'])
                ->middleware(EnsurePermission::class.':repayments.view')
                ->name('repayments.index');
            Route::get('repayments/create', [RepaymentController::class, 'create'])
                ->middleware(EnsurePermission::class.':repayments.manage')
                ->name('repayments.create');
            Route::post('repayments', [RepaymentController::class, 'store'])
                ->middleware(EnsurePermission::class.':repayments.manage')
                ->name('repayments.store');

            Route::get('reports', [ReportController::class, 'index'])
                ->middleware(EnsurePermission::class.':reports.view')
                ->name('reports.index');

            Route::get('audit-logs', [AuditLogController::class, 'index'])
                ->middleware(EnsurePermission::class.':audit_logs.view')
                ->name('audit-logs.index');
        });
    });

    Route::prefix('portal')->name('portal.')->middleware([
        'auth:sanctum',
        EnsureApiPortalCustomer::class,
        SetOrganizationFromPortalCustomer::class,
    ])->group(function () {
        Route::post('logout', [PortalAuthController::class, 'destroy'])->name('logout');
        Route::get('me', PortalMeController::class)->name('me');
        Route::get('dashboard', PortalDashboardController::class)->name('dashboard');

        Route::get('loans', [PortalLoanController::class, 'index'])->name('loans.index');
        Route::get('loans/{loan}', [PortalLoanController::class, 'show'])->name('loans.show');

        Route::get('applications', [PortalApplicationController::class, 'index'])->name('applications.index');
        Route::post('applications', [PortalApplicationController::class, 'store'])->name('applications.store');
        Route::get('applications/{loan_application}', [PortalApplicationController::class, 'show'])->name('applications.show');
        Route::post('applications/{loan_application}/submit', [PortalApplicationController::class, 'submit'])->name('applications.submit');

        Route::put('profile', [PortalProfileController::class, 'update'])->name('profile.update');
        Route::put('profile/password', [PortalProfileController::class, 'updatePassword'])->name('profile.password');
    });
});

<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminInvoiceController;
use App\Http\Controllers\Admin\AdminOrganizationController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\Admin\AdminSubscriptionPlanController;
use App\Http\Controllers\Admin\AdminPlatformSettingsController;
use App\Http\Controllers\Admin\AdminSystemController;
use Illuminate\Support\Facades\Route;

Route::get('/', AdminDashboardController::class)->name('dashboard');

Route::get('organizations', [AdminOrganizationController::class, 'index'])->name('organizations.index');
Route::get('organizations/{organization}', [AdminOrganizationController::class, 'show'])->name('organizations.show');
Route::post('organizations/{organization}/subscription', [AdminOrganizationController::class, 'updateSubscription'])
    ->name('organizations.subscription.update');

Route::resource('plans', AdminSubscriptionPlanController::class)->except(['show']);

Route::get('subscriptions', [AdminSubscriptionController::class, 'index'])->name('subscriptions.index');
Route::post('subscriptions/{subscription}/cancel', [AdminSubscriptionController::class, 'cancel'])->name('subscriptions.cancel');
Route::post('subscriptions/{subscription}/activate', [AdminSubscriptionController::class, 'activate'])->name('subscriptions.activate');
Route::post('subscriptions/{subscription}/renew', [AdminSubscriptionController::class, 'renew'])->name('subscriptions.renew');

Route::get('invoices', [AdminInvoiceController::class, 'index'])->name('invoices.index');
Route::get('invoices/create', [AdminInvoiceController::class, 'create'])->name('invoices.create');
Route::post('invoices', [AdminInvoiceController::class, 'store'])->name('invoices.store');
Route::post('invoices/{invoice}/paid', [AdminInvoiceController::class, 'markPaid'])->name('invoices.paid');

Route::get('system', [AdminSystemController::class, 'index'])->name('system.index');

Route::prefix('settings')->name('settings.')->group(function () {
    Route::get('/', [AdminPlatformSettingsController::class, 'index'])->name('index');
    Route::get('welcome', [AdminPlatformSettingsController::class, 'welcome'])->name('welcome');
    Route::put('welcome', [AdminPlatformSettingsController::class, 'updateWelcome'])->name('welcome.update');
    Route::get('notifications', [AdminPlatformSettingsController::class, 'notifications'])->name('notifications');
    Route::put('notifications', [AdminPlatformSettingsController::class, 'updateNotifications'])->name('notifications.update');
    Route::post('sms/test', [AdminPlatformSettingsController::class, 'testSms'])->name('sms.test');
    Route::get('yo-payments', [AdminPlatformSettingsController::class, 'yoPayments'])->name('yo-payments');
    Route::put('yo-payments', [AdminPlatformSettingsController::class, 'updateYoPayments'])->name('yo-payments.update');
    Route::post('yo-payments/test', [AdminPlatformSettingsController::class, 'testYoPayments'])->name('yo-payments.test');
    Route::get('africas-talking', [AdminPlatformSettingsController::class, 'africasTalking'])->name('africas-talking');
    Route::put('africas-talking', [AdminPlatformSettingsController::class, 'updateAfricasTalking'])->name('africas-talking.update');
    Route::post('africas-talking/test', [AdminPlatformSettingsController::class, 'testAfricasTalking'])->name('africas-talking.test');
    Route::get('smtp', [AdminPlatformSettingsController::class, 'smtp'])->name('smtp');
    Route::put('smtp', [AdminPlatformSettingsController::class, 'updateSmtp'])->name('smtp.update');
    Route::post('smtp/test', [AdminPlatformSettingsController::class, 'testEmail'])->name('smtp.test');
});

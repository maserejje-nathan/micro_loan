<?php

namespace App\Providers;

use App\Contracts\MobileMoneyGateway;
use App\Contracts\SmsGateway;
use App\Models\SubscriptionPlan;
use App\Services\MobileMoney\StubMobileMoneyGateway;
use App\Services\MobileMoney\YoPaymentsGateway;
use App\Services\OrganizationSetupService;
use App\Services\PlatformSettingsService;
use App\Services\Sms\AfricasTalkingSmsGateway;
use App\Services\Sms\LogSmsGateway;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SmsGateway::class, function () {
            return match (config('sms.driver')) {
                'africas_talking' => $this->app->make(AfricasTalkingSmsGateway::class),
                default => $this->app->make(LogSmsGateway::class),
            };
        });

        $this->app->singleton(MobileMoneyGateway::class, function () {
            return match (config('payments.mobile_money_driver')) {
                'yo' => $this->app->make(YoPaymentsGateway::class),
                default => $this->app->make(StubMobileMoneyGateway::class),
            };
        });
    }

    public function boot(): void
    {
        if (Schema::hasTable('platform_settings')) {
            $this->app->make(PlatformSettingsService::class)->applyRuntimeConfig();
        }

        if (Schema::hasTable('permissions')) {
            $this->app->make(OrganizationSetupService::class)->seedPermissions();
        }

        if (Schema::hasTable('subscription_plans') && SubscriptionPlan::query()->doesntExist()) {
            (new SubscriptionPlanSeeder)->run();
        }

        Gate::before(function ($user, string $ability) {
            if ($user->roleInOrganization()?->slug === 'owner') {
                return true;
            }

            return null;
        });
    }
}

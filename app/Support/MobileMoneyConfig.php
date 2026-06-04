<?php

namespace App\Support;

class MobileMoneyConfig
{
    /**
     * @return array{
     *     driver: string,
     *     yo_configured: bool,
     *     uses_yo_payments: bool,
     *     driver_label: string,
     *     can_disburse: bool
     * }
     */
    public static function summary(): array
    {
        $driver = (string) config('payments.mobile_money_driver');
        $yo = config('payments.yo');
        $yoConfigured = filled($yo['username'] ?? null) && filled($yo['password'] ?? null);
        $usesYo = $driver === 'yo';

        return [
            'driver' => $driver,
            'yo_configured' => $yoConfigured,
            'uses_yo_payments' => $usesYo,
            'driver_label' => match (true) {
                $usesYo && $yoConfigured => 'Yo! Payments',
                $usesYo => 'Yo! Payments (not configured)',
                $driver === 'stub' => 'Mobile money (simulated)',
                default => 'Mobile money',
            },
            'can_disburse' => $usesYo ? $yoConfigured : true,
        ];
    }
}

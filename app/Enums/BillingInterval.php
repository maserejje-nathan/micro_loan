<?php

namespace App\Enums;

use Carbon\Carbon;

enum BillingInterval: string
{
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    public function label(): string
    {
        return match ($this) {
            self::Monthly => 'Monthly',
            self::Yearly => 'Yearly',
        };
    }

    public function periodEndFrom(Carbon $start): Carbon
    {
        return match ($this) {
            self::Monthly => $start->copy()->addMonth(),
            self::Yearly => $start->copy()->addYear(),
        };
    }
}

<?php

namespace App\Enums;

enum RepaymentFrequency: string
{
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';

    public function installmentsForTerm(int $termDays): int
    {
        return match ($this) {
            self::Daily => max(1, $termDays),
            self::Weekly => max(1, (int) ceil($termDays / 7)),
            self::Monthly => max(1, (int) ceil($termDays / 30)),
        };
    }
}

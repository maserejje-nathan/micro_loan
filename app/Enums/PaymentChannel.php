<?php

namespace App\Enums;

enum PaymentChannel: string
{
    case Cash = 'cash';
    case MobileMoney = 'mobile_money';
    case Bank = 'bank';
}

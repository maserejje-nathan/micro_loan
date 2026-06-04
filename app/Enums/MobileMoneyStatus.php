<?php

namespace App\Enums;

enum MobileMoneyStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
}

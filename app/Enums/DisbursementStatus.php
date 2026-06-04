<?php

namespace App\Enums;

enum DisbursementStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
}

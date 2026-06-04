<?php

namespace App\Enums;

enum LoanStatus: string
{
    case PendingDisbursement = 'pending_disbursement';
    case Active = 'active';
    case Closed = 'closed';
    case Defaulted = 'defaulted';
    case WrittenOff = 'written_off';
}

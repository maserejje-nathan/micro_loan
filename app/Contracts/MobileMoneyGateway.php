<?php

namespace App\Contracts;

use App\Models\MobileMoneyTransaction;

interface MobileMoneyGateway
{
    public function disburse(MobileMoneyTransaction $transaction): MobileMoneyTransaction;

    public function collect(MobileMoneyTransaction $transaction): MobileMoneyTransaction;
}

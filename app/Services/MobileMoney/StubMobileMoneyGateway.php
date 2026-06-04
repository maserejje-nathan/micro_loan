<?php

namespace App\Services\MobileMoney;

use App\Contracts\MobileMoneyGateway;
use App\Enums\MobileMoneyStatus;
use App\Models\MobileMoneyTransaction;
use Illuminate\Support\Str;

class StubMobileMoneyGateway implements MobileMoneyGateway
{
    public function disburse(MobileMoneyTransaction $transaction): MobileMoneyTransaction
    {
        return $this->complete($transaction);
    }

    public function collect(MobileMoneyTransaction $transaction): MobileMoneyTransaction
    {
        return $this->complete($transaction);
    }

    protected function complete(MobileMoneyTransaction $transaction): MobileMoneyTransaction
    {
        $transaction->update([
            'status' => MobileMoneyStatus::Completed,
            'external_id' => 'MM-'.Str::upper(Str::random(10)),
            'payload' => array_merge($transaction->payload ?? [], [
                'stub' => true,
                'completed_at' => now()->toIso8601String(),
            ]),
        ]);

        return $transaction->fresh();
    }
}

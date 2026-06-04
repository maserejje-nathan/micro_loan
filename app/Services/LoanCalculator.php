<?php

namespace App\Services;

use App\Enums\InterestType;
use App\Enums\RepaymentFrequency;
use App\Models\LoanProduct;

class LoanCalculator
{
    /**
     * @return array{
     *     principal: int,
     *     total_interest: int,
     *     processing_fee: int,
     *     total_repayable: int,
     *     installment_count: int,
     *     installment_amount: int
     * }
     */
    public function estimate(
        int $principal,
        float $interestRate,
        InterestType $interestType,
        int $termDays,
        int $processingFee = 0,
        RepaymentFrequency $repaymentFrequency = RepaymentFrequency::Monthly,
    ): array {
        $totalInterest = match ($interestType) {
            InterestType::Flat => (int) round($principal * ($interestRate / 100)),
            InterestType::Reducing => (int) round($principal * ($interestRate / 100) * ($termDays / 365)),
        };

        $totalRepayable = $principal + $totalInterest + $processingFee;
        $installmentCount = $repaymentFrequency->installmentsForTerm($termDays);
        $installmentAmount = (int) round($totalRepayable / $installmentCount);

        return [
            'principal' => $principal,
            'total_interest' => $totalInterest,
            'processing_fee' => $processingFee,
            'total_repayable' => $totalRepayable,
            'installment_count' => $installmentCount,
            'installment_amount' => $installmentAmount,
        ];
    }

    /**
     * @return array{total_interest: int, total_repayable: int}
     */
    public function calculate(int $principal, LoanProduct $product, int $termDays): array
    {
        $estimate = $this->estimate(
            $principal,
            (float) $product->interest_rate,
            $product->interest_type,
            $termDays,
            (int) $product->processing_fee,
            $product->repayment_frequency,
        );

        return [
            'total_interest' => $estimate['total_interest'],
            'total_repayable' => $estimate['total_repayable'],
        ];
    }
}

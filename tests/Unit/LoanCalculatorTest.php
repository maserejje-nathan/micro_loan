<?php

use App\Enums\InterestType;
use App\Enums\RepaymentFrequency;
use App\Services\LoanCalculator;

test('flat interest estimate matches principal times rate', function () {
    $result = app(LoanCalculator::class)->estimate(
        principal: 1_000_000,
        interestRate: 10,
        interestType: InterestType::Flat,
        termDays: 30,
        processingFee: 5_000,
        repaymentFrequency: RepaymentFrequency::Monthly,
    );

    expect($result['total_interest'])->toBe(100_000)
        ->and($result['total_repayable'])->toBe(1_105_000)
        ->and($result['installment_count'])->toBe(1)
        ->and($result['installment_amount'])->toBe(1_105_000);
});

test('reducing interest scales with term days', function () {
    $calculator = app(LoanCalculator::class);

    $short = $calculator->estimate(
        principal: 1_000_000,
        interestRate: 12,
        interestType: InterestType::Reducing,
        termDays: 30,
    );

    $long = $calculator->estimate(
        principal: 1_000_000,
        interestRate: 12,
        interestType: InterestType::Reducing,
        termDays: 365,
    );

    expect($short['total_interest'])->toBeLessThan($long['total_interest'])
        ->and($long['total_interest'])->toBe(120_000);
});

test('weekly frequency increases installment count', function () {
    $result = app(LoanCalculator::class)->estimate(
        principal: 500_000,
        interestRate: 10,
        interestType: InterestType::Flat,
        termDays: 28,
        repaymentFrequency: RepaymentFrequency::Weekly,
    );

    expect($result['installment_count'])->toBe(4)
        ->and($result['installment_amount'])->toBe(137_500);
});

<?php

namespace App\Services;

use App\Enums\ScheduleInstallmentStatus;
use App\Models\Loan;
use App\Models\LoanSchedule;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class LoanScheduleGenerator
{
    /**
     * @return Collection<int, LoanSchedule>
     */
    public function generate(Loan $loan): Collection
    {
        $installments = $loan->repayment_frequency->installmentsForTerm($loan->term_days);
        $principalPerInstallment = (int) floor($loan->principal / $installments);
        $interestPerInstallment = (int) floor($loan->total_interest / $installments);
        $startDate = Carbon::parse($loan->disbursed_at ?? now())->addDays(0);

        $schedules = collect();

        for ($i = 1; $i <= $installments; $i++) {
            $dueDate = match ($loan->repayment_frequency->value) {
                'daily' => $startDate->copy()->addDays($i),
                'weekly' => $startDate->copy()->addWeeks($i),
                default => $startDate->copy()->addMonths($i),
            };

            $principalAmount = $i === $installments
                ? $loan->principal - ($principalPerInstallment * ($installments - 1))
                : $principalPerInstallment;

            $interestAmount = $i === $installments
                ? $loan->total_interest - ($interestPerInstallment * ($installments - 1))
                : $interestPerInstallment;

            $schedules->push(LoanSchedule::query()->create([
                'loan_id' => $loan->id,
                'installment_number' => $i,
                'due_date' => $dueDate,
                'principal_amount' => $principalAmount,
                'interest_amount' => $interestAmount,
                'total_amount' => $principalAmount + $interestAmount,
                'paid_amount' => 0,
                'status' => ScheduleInstallmentStatus::Pending,
            ]));
        }

        return $schedules;
    }
}

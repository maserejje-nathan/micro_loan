<?php

namespace App\Services;

use App\Models\Loan;
use Barryvdh\DomPDF\Facade\Pdf;

class LoanStatementService
{
    /**
     * @return array<string, mixed>
     */
    public function build(Loan $loan): array
    {
        $loan->load(['customer', 'organization', 'schedules', 'repayments']);

        return [
            'organization' => $loan->organization,
            'loan' => $loan,
            'customer' => $loan->customer,
            'schedules' => $loan->schedules,
            'repayments' => $loan->repayments,
            'generated_at' => now(),
        ];
    }

    public function download(Loan $loan)
    {
        $data = $this->build($loan);

        $pdf = Pdf::loadView('pdf.loan-statement', $data)
            ->setPaper('a4');

        $filename = 'statement-'.$loan->reference_number.'.pdf';

        return $pdf->download($filename);
    }
}

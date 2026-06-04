<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Services\LoanStatementService;
use Symfony\Component\HttpFoundation\Response;

class LoanStatementController extends Controller
{
    public function __invoke(Loan $loan, LoanStatementService $statements): Response
    {
        return $statements->download($loan);
    }
}

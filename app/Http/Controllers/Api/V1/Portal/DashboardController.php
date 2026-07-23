<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Enums\LoanApplicationStatus;
use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Support\LoanCalculatorCatalog;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $organization = OrganizationContext::get();
        $portal = OrganizationPortalSettings::for($organization);

        return response()->json([
            'portal' => $portal,
            'stats' => [
                'active_loans' => $customer->loans()->where('status', LoanStatus::Active)->count(),
                'outstanding' => (int) $customer->loans()
                    ->where('status', LoanStatus::Active)
                    ->sum('outstanding_balance'),
                'pending_applications' => $customer->loanApplications()
                    ->whereIn('status', [
                        LoanApplicationStatus::Submitted,
                        LoanApplicationStatus::UnderReview,
                    ])
                    ->count(),
                'draft_applications' => $customer->loanApplications()
                    ->where('status', LoanApplicationStatus::Draft)
                    ->count(),
            ],
            'recent_loans' => $customer->loans()
                ->with('loanProduct')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($loan) => [
                    'id' => $loan->id,
                    'reference_number' => $loan->reference_number,
                    'product_name' => $loan->loanProduct->name,
                    'outstanding_balance' => $loan->outstanding_balance,
                    'status' => $loan->status->value,
                ])
                ->values()
                ->all(),
            'recent_applications' => $customer->loanApplications()
                ->with('loanProduct')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($application) => [
                    'id' => $application->id,
                    'reference_number' => $application->reference_number,
                    'product_name' => $application->loanProduct->name,
                    'requested_amount' => $application->requested_amount,
                    'status' => $application->status->value,
                    'created_at' => $application->created_at->toDateString(),
                ])
                ->values()
                ->all(),
            'currency' => $organization?->currency ?? 'UGX',
            'loan_calculator' => LoanCalculatorCatalog::forOrganization(
                $organization?->currency,
            ),
        ]);
    }
}

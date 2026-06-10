<?php

namespace App\Http\Controllers\Portal;

use App\Enums\LoanApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\PortalStoreLoanApplicationRequest;
use App\Models\Customer;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Services\LoanApplicationService;
use App\Services\ReferenceNumberGenerator;
use App\Support\ListPagination;
use App\Support\LoanApplicationCollateralData;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalLoanApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var Customer $customer */
        $customer = $request->user('portal');

        $filter = $request->string('filter')->toString();
        if (! in_array($filter, ['all', 'draft', 'pending', 'approved', 'rejected'], true)) {
            $filter = 'all';
        }

        $applicationsQuery = $customer->loanApplications()
            ->with('loanProduct')
            ->latest()
            ->when(
                $filter === 'draft',
                fn ($query) => $query->where('status', LoanApplicationStatus::Draft),
            )
            ->when(
                $filter === 'pending',
                fn ($query) => $query->whereIn('status', [
                    LoanApplicationStatus::Submitted,
                    LoanApplicationStatus::UnderReview,
                ]),
            )
            ->when(
                $filter === 'approved',
                fn ($query) => $query->where('status', LoanApplicationStatus::Approved),
            )
            ->when(
                $filter === 'rejected',
                fn ($query) => $query->where('status', LoanApplicationStatus::Rejected),
            );

        $applications = $applicationsQuery
            ->paginate(ListPagination::perPage())
            ->withQueryString()
            ->through(fn (LoanApplication $application) => [
                'id' => $application->id,
                'reference_number' => $application->reference_number,
                'product_name' => $application->loanProduct->name,
                'product_code' => $application->loanProduct->code,
                'requested_amount' => $application->requested_amount,
                'approved_amount' => $application->approved_amount,
                'term_days' => $application->term_days,
                'status' => $application->status->value,
                'created_at' => $application->created_at->toDateString(),
            ]);

        $baseQuery = $customer->loanApplications();

        return Inertia::render('portal/applications/index', [
            'applications' => $applications,
            'filter' => $filter,
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'canApply' => OrganizationPortalSettings::for(OrganizationContext::get())['allow_applications'],
            'stats' => [
                'total' => (clone $baseQuery)->count(),
                'draft' => (clone $baseQuery)
                    ->where('status', LoanApplicationStatus::Draft)
                    ->count(),
                'pending' => (clone $baseQuery)
                    ->whereIn('status', [
                        LoanApplicationStatus::Submitted,
                        LoanApplicationStatus::UnderReview,
                    ])
                    ->count(),
                'approved' => (clone $baseQuery)
                    ->where('status', LoanApplicationStatus::Approved)
                    ->count(),
                'rejected' => (clone $baseQuery)
                    ->where('status', LoanApplicationStatus::Rejected)
                    ->count(),
            ],
        ]);
    }

    public function show(Request $request, LoanApplication $loanApplication): Response
    {
        $this->authorizeApplication($request, $loanApplication);

        $loanApplication->load(['loanProduct', 'loan', 'collaterals']);

        $product = $loanApplication->loanProduct;

        return Inertia::render('portal/applications/show', [
            'application' => [
                'id' => $loanApplication->id,
                'reference_number' => $loanApplication->reference_number,
                'product_name' => $product->name,
                'product_code' => $product->code,
                'requested_amount' => $loanApplication->requested_amount,
                'approved_amount' => $loanApplication->approved_amount,
                'term_days' => $loanApplication->term_days,
                'purpose' => $loanApplication->purpose,
                'status' => $loanApplication->status->value,
                'rejection_reason' => $loanApplication->rejection_reason,
                'reviewed_at' => $loanApplication->reviewed_at?->toDateTimeString(),
                'created_at' => $loanApplication->created_at->toDateTimeString(),
                'loan_id' => $loanApplication->loan?->id,
                'collaterals' => LoanApplicationCollateralData::serializeCollection(
                    $loanApplication->collaterals,
                ),
            ],
            'product' => [
                'min_amount' => $product->min_amount,
                'max_amount' => $product->max_amount,
                'term_min_days' => $product->term_min_days,
                'term_max_days' => $product->term_max_days,
            ],
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'canSubmit' => $loanApplication->status === LoanApplicationStatus::Draft,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless(
            OrganizationPortalSettings::for(OrganizationContext::get())['allow_applications'],
            403,
        );

        return Inertia::render('portal/applications/create', [
            'collateralTypes' => LoanApplicationCollateralData::typeOptions(),
            'products' => LoanProduct::query()
                ->where('is_active', true)
                ->get([
                    'id',
                    'name',
                    'code',
                    'min_amount',
                    'max_amount',
                    'term_min_days',
                    'term_max_days',
                ]),
            'currency' => OrganizationContext::get()?->currency ?? 'UGX',
            'formDefaults' => [
                'collaterals' => old('collaterals', []),
            ],
        ]);
    }

    public function store(
        PortalStoreLoanApplicationRequest $request,
        ReferenceNumberGenerator $referenceNumberGenerator,
        LoanApplicationService $loanApplicationService,
    ): RedirectResponse {
        abort_unless(
            OrganizationPortalSettings::for(OrganizationContext::get())['allow_applications'],
            403,
        );

        /** @var Customer $customer */
        $customer = $request->user('portal');

        $validated = $request->validated();
        $collaterals = $validated['collaterals'] ?? [];
        unset($validated['collaterals']);

        $application = LoanApplication::query()->create([
            ...$validated,
            'organization_id' => $customer->organization_id,
            'customer_id' => $customer->id,
            'reference_number' => $referenceNumberGenerator->generate(
                new LoanApplication(['organization_id' => $customer->organization_id]),
                'APP',
            ),
            'status' => LoanApplicationStatus::Draft,
            'created_by' => null,
        ]);

        if ($collaterals !== []) {
            $loanApplicationService->storeCollaterals($application, $collaterals);
        }

        return redirect()
            ->route('portal.applications.show', $application)
            ->with('success', 'Application saved. Submit it when you are ready.');
    }

    public function submit(
        Request $request,
        LoanApplication $loanApplication,
        LoanApplicationService $service,
    ): RedirectResponse {
        $this->authorizeApplication($request, $loanApplication);

        $service->submit($loanApplication);

        return back()->with('success', 'Application submitted for review.');
    }

    protected function authorizeApplication(Request $request, LoanApplication $application): void
    {
        /** @var Customer $customer */
        $customer = $request->user('portal');

        abort_unless($application->customer_id === $customer->id, 403);
    }
}

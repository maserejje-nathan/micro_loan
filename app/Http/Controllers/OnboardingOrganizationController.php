<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationRequest;
use App\Services\OrganizationSetupService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingOrganizationController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('onboarding/organization');
    }

    public function store(
        StoreOrganizationRequest $request,
        OrganizationSetupService $setup,
    ): RedirectResponse {
        $setup->createForUser($request->user(), $request->validated('name'));

        return redirect()->route('dashboard');
    }
}

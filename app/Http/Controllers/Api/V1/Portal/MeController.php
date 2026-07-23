<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CustomerResource;
use App\Http\Resources\Api\V1\OrganizationResource;
use App\Models\Customer;
use App\Support\OrganizationContext;
use App\Support\OrganizationPortalSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();
        $customer->loadMissing('organization');

        $organization = OrganizationContext::get() ?? $customer->organization;

        return response()->json([
            'customer' => CustomerResource::make($customer)->resolve(),
            'organization' => $organization
                ? OrganizationResource::make($organization)->resolve()
                : null,
            'portal' => $organization
                ? OrganizationPortalSettings::for($organization)
                : null,
        ]);
    }
}

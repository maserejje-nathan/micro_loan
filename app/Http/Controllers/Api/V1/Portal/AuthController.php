<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Portal\PortalLoginRequest;
use App\Http\Resources\Api\V1\CustomerResource;
use App\Http\Resources\Api\V1\OrganizationResource;
use App\Models\Organization;
use App\Services\CustomerPortalService;
use App\Support\OrganizationPortalSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function store(PortalLoginRequest $request, CustomerPortalService $portal): JsonResponse
    {
        $organization = Organization::query()
            ->where('slug', $request->string('organization_slug')->toString())
            ->first();

        if ($organization === null) {
            throw ValidationException::withMessages([
                'organization_slug' => ['Enter a valid lender code to sign in.'],
            ]);
        }

        if (! OrganizationPortalSettings::isEnabled($organization)) {
            throw ValidationException::withMessages([
                'phone' => ['The client portal is not available for this lender.'],
            ]);
        }

        $customer = $portal->findForLogin($organization, $request->string('phone')->toString());

        if ($customer === null || ! Hash::check($request->string('password')->toString(), $customer->portal_password)) {
            throw ValidationException::withMessages([
                'phone' => ['These credentials do not match our records.'],
            ]);
        }

        $customer->forceFill(['portal_last_login_at' => now()])->save();
        $customer->loadMissing('organization');

        $deviceName = $request->string('device_name')->toString() ?: 'portal-mobile';
        $token = $customer->createToken($deviceName)->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'customer' => CustomerResource::make($customer)->resolve(),
            'organization' => OrganizationResource::make($organization)->resolve(),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Signed out.',
        ]);
    }
}

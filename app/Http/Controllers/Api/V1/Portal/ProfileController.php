<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\PortalUpdatePasswordRequest;
use App\Http\Requests\Portal\PortalUpdateProfileRequest;
use App\Http\Resources\Api\V1\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerPortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(PortalUpdateProfileRequest $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $customer->update($request->validated());
        $customer->loadMissing('organization');

        return response()->json([
            'message' => 'Profile updated.',
            'customer' => CustomerResource::make($customer->fresh())->resolve(),
        ]);
    }

    public function updatePassword(
        PortalUpdatePasswordRequest $request,
        CustomerPortalService $portal,
    ): JsonResponse {
        /** @var Customer $customer */
        $customer = $request->user();

        if (! Hash::check($request->string('current_password')->toString(), $customer->portal_password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $portal->resetPassword($customer, $request->string('password')->toString());

        return response()->json([
            'message' => 'Password updated.',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $user?->loadMissing('currentOrganization');

        $role = $user?->roleInOrganization();

        return response()->json([
            'user' => UserResource::make($user)->resolve(),
            'permissions' => $user?->isSuperAdmin()
                ? ['*']
                : ($role
                    ? $role->permissions()->pluck('name')->values()->all()
                    : []),
        ]);
    }
}

<?php

namespace App\Http\Resources\Api\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_super_admin' => $this->isSuperAdmin(),
            'organization' => $this->when(
                $this->relationLoaded('currentOrganization') && $this->currentOrganization !== null,
                fn () => OrganizationResource::make($this->currentOrganization)->resolve(),
            ),
        ];
    }
}

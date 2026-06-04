<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('users.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $organizationId = $this->user()?->current_organization_id;

        return [
            'email' => ['required', 'email', 'max:255'],
            'role_id' => [
                'required',
                Rule::exists('roles', 'id')->where('organization_id', $organizationId),
            ],
        ];
    }
}

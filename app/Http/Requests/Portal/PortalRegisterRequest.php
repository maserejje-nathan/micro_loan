<?php

namespace App\Http\Requests\Portal;

use App\Http\Requests\Concerns\ValidatesCustomerIdDocuments;
use App\Http\Requests\Concerns\ValidatesCustomerKyc;
use App\Models\Customer;
use App\Models\Organization;
use App\Services\CustomerPortalService;
use App\Support\OrganizationContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class PortalRegisterRequest extends FormRequest
{
    use ValidatesCustomerIdDocuments;
    use ValidatesCustomerKyc;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->prepareKycForValidation();

        if ($this->filled('phone')) {
            $this->merge([
                'phone' => app(CustomerPortalService::class)->normalizePhone(
                    $this->string('phone')->toString(),
                ),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $organization = $this->resolveOrganization();

        return [
            'organization_slug' => ['nullable', 'string', 'max:100'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique(Customer::class, 'phone')
                    ->where(fn ($query) => $organization
                        ? $query->where('organization_id', $organization->id)
                        : $query),
            ],
            'email' => ['nullable', 'email', 'max:255'],
            'national_id' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'confirmed', Password::defaults()],
            ...$this->customerKycRules(),
            ...$this->customerIdDocumentRules(required: true),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.unique' => 'An account with this phone number already exists. Sign in or use a different number.',
        ];
    }

    protected function resolveOrganization(): ?Organization
    {
        $organization = OrganizationContext::get();

        if ($organization !== null) {
            return $organization;
        }

        if (! $this->filled('organization_slug')) {
            return null;
        }

        return Organization::query()
            ->where('slug', $this->string('organization_slug')->toString())
            ->first();
    }
}

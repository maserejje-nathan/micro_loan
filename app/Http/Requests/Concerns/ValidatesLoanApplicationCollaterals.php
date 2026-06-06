<?php

namespace App\Http\Requests\Concerns;

use App\Enums\CollateralType;
use Illuminate\Validation\Rule;

trait ValidatesLoanApplicationCollaterals
{
    /**
     * @return array<string, mixed>
     */
    protected function collateralRules(): array
    {
        return [
            'collaterals' => ['nullable', 'array', 'max:10'],
            'collaterals.*.type' => ['required', Rule::enum(CollateralType::class)],
            'collaterals.*.description' => ['required', 'string', 'max:500'],
            'collaterals.*.estimated_value' => ['required', 'integer', 'min:1'],
            'collaterals.*.identifier' => ['nullable', 'string', 'max:100'],
        ];
    }
}

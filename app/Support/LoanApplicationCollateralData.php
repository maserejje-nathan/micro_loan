<?php

namespace App\Support;

use App\Enums\CollateralType;
use App\Models\LoanApplicationCollateral;
use Illuminate\Support\Collection;

class LoanApplicationCollateralData
{
    /**
     * @return list<array{value: string, label: string}>
     */
    public static function typeOptions(): array
    {
        return collect(CollateralType::cases())
            ->map(fn (CollateralType $type) => [
                'value' => $type->value,
                'label' => match ($type) {
                    CollateralType::Vehicle => 'Vehicle',
                    CollateralType::Property => 'Property / land',
                    CollateralType::Equipment => 'Equipment / machinery',
                    CollateralType::Livestock => 'Livestock',
                    CollateralType::Jewellery => 'Jewellery',
                    CollateralType::Electronics => 'Electronics',
                    CollateralType::Other => 'Other',
                },
            ])
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, LoanApplicationCollateral>  $collaterals
     * @return list<array{
     *     id: int,
     *     type: string,
     *     description: string,
     *     estimated_value: int,
     *     identifier: string|null
     * }>
     */
    public static function serializeCollection(Collection $collaterals): array
    {
        return $collaterals
            ->map(fn (LoanApplicationCollateral $collateral) => [
                'id' => $collateral->id,
                'type' => $collateral->type->value,
                'description' => $collateral->description,
                'estimated_value' => $collateral->estimated_value,
                'identifier' => $collateral->identifier,
            ])
            ->values()
            ->all();
    }
}

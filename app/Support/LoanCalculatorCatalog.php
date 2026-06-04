<?php

namespace App\Support;

use App\Enums\InterestType;
use App\Enums\RepaymentFrequency;
use App\Models\LoanProduct;
use Illuminate\Support\Collection;

class LoanCalculatorCatalog
{
    /**
     * @return array{
     *     currency: string,
     *     products: list<array<string, mixed>>,
     *     interestTypes: list<string>,
     *     repaymentFrequencies: list<string>,
     *     defaults: array<string, mixed>
     * }
     */
    public static function forOrganization(?string $currency = null): array
    {
        $currency ??= OrganizationContext::get()?->currency ?? 'UGX';

        $products = LoanProduct::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (LoanProduct $product) => self::mapProduct($product))
            ->values()
            ->all();

        $first = $products[0] ?? null;

        return [
            'currency' => $currency,
            'products' => $products,
            'interestTypes' => array_column(InterestType::cases(), 'value'),
            'repaymentFrequencies' => array_column(RepaymentFrequency::cases(), 'value'),
            'defaults' => $first ?? [
                'principal' => 500_000,
                'term_days' => 30,
                'interest_rate' => 10,
                'interest_type' => InterestType::Flat->value,
                'repayment_frequency' => RepaymentFrequency::Monthly->value,
                'processing_fee' => 0,
            ],
        ];
    }

    /**
     * @return array{
     *     currency: string,
     *     products: list<array<string, mixed>>,
     *     interestTypes: list<string>,
     *     repaymentFrequencies: list<string>,
     *     defaults: array<string, mixed>
     * }
     */
    public static function forPublic(): array
    {
        return [
            'currency' => 'UGX',
            'products' => [],
            'interestTypes' => array_column(InterestType::cases(), 'value'),
            'repaymentFrequencies' => array_column(RepaymentFrequency::cases(), 'value'),
            'defaults' => [
                'principal' => 500_000,
                'term_days' => 30,
                'interest_rate' => 10,
                'interest_type' => InterestType::Flat->value,
                'repayment_frequency' => RepaymentFrequency::Monthly->value,
                'processing_fee' => 0,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function mapProduct(LoanProduct $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'code' => $product->code,
            'min_amount' => $product->min_amount,
            'max_amount' => $product->max_amount,
            'term_min_days' => $product->term_min_days,
            'term_max_days' => $product->term_max_days,
            'interest_rate' => (float) $product->interest_rate,
            'interest_type' => $product->interest_type->value,
            'repayment_frequency' => $product->repayment_frequency->value,
            'processing_fee' => (int) $product->processing_fee,
        ];
    }

    /**
     * @param  Collection<int, LoanProduct>|null  $products
     * @return list<array<string, mixed>>
     */
    public static function mapProducts(?Collection $products = null): array
    {
        $query = $products ?? LoanProduct::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $query
            ->map(fn (LoanProduct $product) => self::mapProduct($product))
            ->values()
            ->all();
    }
}

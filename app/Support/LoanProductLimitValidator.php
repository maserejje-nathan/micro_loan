<?php

namespace App\Support;

use App\Models\LoanProduct;
use InvalidArgumentException;

class LoanProductLimitValidator
{
    /**
     * @return array<string, string>
     */
    public static function errors(LoanProduct $product, int $amount, int $termDays): array
    {
        $errors = [];

        if ($amount < $product->min_amount || $amount > $product->max_amount) {
            $errors['amount'] = sprintf(
                'Amount must be between %s and %s for this product.',
                number_format($product->min_amount),
                number_format($product->max_amount),
            );
        }

        if ($termDays < $product->term_min_days || $termDays > $product->term_max_days) {
            $errors['term_days'] = sprintf(
                'Term must be between %d and %d days for this product.',
                $product->term_min_days,
                $product->term_max_days,
            );
        }

        return $errors;
    }

    public static function assertValid(LoanProduct $product, int $amount, int $termDays): void
    {
        $errors = self::errors($product, $amount, $termDays);

        if ($errors !== []) {
            throw new InvalidArgumentException(reset($errors));
        }
    }
}

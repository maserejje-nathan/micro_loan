<?php

namespace App\Support;

final class ListPagination
{
    public const PER_PAGE = 10;

    public static function perPage(): int
    {
        return self::PER_PAGE;
    }
}

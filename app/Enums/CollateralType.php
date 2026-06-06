<?php

namespace App\Enums;

enum CollateralType: string
{
    case Vehicle = 'vehicle';
    case Property = 'property';
    case Equipment = 'equipment';
    case Livestock = 'livestock';
    case Jewellery = 'jewellery';
    case Electronics = 'electronics';
    case Other = 'other';
}

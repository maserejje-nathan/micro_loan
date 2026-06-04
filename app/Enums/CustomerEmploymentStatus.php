<?php

namespace App\Enums;

enum CustomerEmploymentStatus: string
{
    case Employed = 'employed';
    case SelfEmployed = 'self_employed';
    case Unemployed = 'unemployed';
    case Student = 'student';
    case Retired = 'retired';
}

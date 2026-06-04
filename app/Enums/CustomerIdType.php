<?php

namespace App\Enums;

enum CustomerIdType: string
{
    case NationalId = 'national_id';
    case Passport = 'passport';
    case DrivingLicense = 'driving_license';
    case VoterId = 'voter_id';
}

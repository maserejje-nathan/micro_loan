<?php

namespace App\Contracts;

use App\Models\SmsNotification;

interface SmsGateway
{
    public function send(SmsNotification $notification): bool;
}

<?php

return [

    /*
    |--------------------------------------------------------------------------
    | SMS Driver
    |--------------------------------------------------------------------------
    |
    | Supported: "log", "africas_talking"
    |
    */

    'driver' => env('SMS_DRIVER', 'log'),

    'africas_talking' => [
        'username' => env('AFRICAS_TALKING_USERNAME'),
        'api_key' => env('AFRICAS_TALKING_API_KEY'),
        'from' => env('AFRICAS_TALKING_FROM'),
        'endpoint' => env('AFRICAS_TALKING_ENDPOINT', 'https://api.africastalking.com/version1/messaging'),
    ],

];

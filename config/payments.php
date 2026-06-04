<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mobile Money Driver
    |--------------------------------------------------------------------------
    |
    | Supported: "stub", "yo"
    |
    */

    'mobile_money_driver' => env('MOBILE_MONEY_DRIVER', 'stub'),

    'yo' => [
        'username' => env('YO_PAYMENTS_USERNAME'),
        'password' => env('YO_PAYMENTS_PASSWORD'),
        'account' => env('YO_PAYMENTS_ACCOUNT'),
        'api_url' => env('YO_PAYMENTS_API_URL', 'https://paymentsapi1.yo.co.ug/ybs/task.php'),
        'sandbox_api_url' => env('YO_PAYMENTS_SANDBOX_API_URL', 'https://sandbox.yopayments.com/ybs/task.php'),
        'sandbox' => env('YO_PAYMENTS_SANDBOX', true),
        'non_blocking' => env('YO_PAYMENTS_NON_BLOCKING', true),
    ],

];

<?php

return [

    'subdomain_enabled' => env('TENANCY_SUBDOMAIN_ENABLED', false),

    /*
    | Base domain for tenant subdomains, e.g. "loan.test" → acme.loan.test
    */
    'base_domain' => env('TENANCY_BASE_DOMAIN', 'localhost'),

    /*
    | Hosts that are not tenant subdomains (central app / marketing).
    */
    'central_hosts' => array_filter(array_map(
        trim(...),
        explode(',', env('TENANCY_CENTRAL_HOSTS', 'localhost,127.0.0.1'))
    )),

    'reserved_subdomains' => ['www', 'app', 'api', 'admin', 'mail'],

];

<?php

use App\Models\Organization;
use App\Support\Tenancy;
use Illuminate\Http\Request;

test('extracts subdomain from tenant host', function () {
    config([
        'tenancy.subdomain_enabled' => true,
        'tenancy.base_domain' => 'loan.test',
        'tenancy.central_hosts' => ['loan.test'],
    ]);

    $request = Request::create('http://acme.loan.test/dashboard');

    expect(Tenancy::extractSubdomain($request))->toBe('acme');
});

test('resolves organization by subdomain', function () {
    config([
        'tenancy.subdomain_enabled' => true,
        'tenancy.base_domain' => 'loan.test',
    ]);

    $organization = Organization::factory()->create([
        'slug' => 'acme',
        'subdomain' => 'acme',
    ]);

    $request = Request::create('http://acme.loan.test/');

    expect(Tenancy::resolveOrganization($request)?->id)->toBe($organization->id);
});

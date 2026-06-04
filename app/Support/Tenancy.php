<?php

namespace App\Support;

use App\Models\Organization;
use Illuminate\Http\Request;

class Tenancy
{
    public static function isEnabled(): bool
    {
        return (bool) config('tenancy.subdomain_enabled');
    }

    public static function baseDomain(): string
    {
        return (string) config('tenancy.base_domain');
    }

    public static function extractSubdomain(Request $request): ?string
    {
        if (! static::isEnabled()) {
            return null;
        }

        $host = $request->getHost();

        if (in_array($host, config('tenancy.central_hosts', []), true)) {
            return null;
        }

        $base = static::baseDomain();

        if (! str_ends_with($host, '.'.$base)) {
            return null;
        }

        $subdomain = substr($host, 0, -strlen('.'.$base));

        if ($subdomain === '' || in_array($subdomain, config('tenancy.reserved_subdomains', []), true)) {
            return null;
        }

        return $subdomain;
    }

    public static function resolveOrganization(Request $request): ?Organization
    {
        $subdomain = static::extractSubdomain($request);

        if ($subdomain === null) {
            return null;
        }

        return Organization::query()
            ->where('subdomain', $subdomain)
            ->first();
    }

    public static function organizationUrl(Organization $organization, string $path = '/'): string
    {
        if (! static::isEnabled() || empty($organization->subdomain)) {
            return url($path);
        }

        $scheme = parse_url((string) config('app.url'), PHP_URL_SCHEME) ?? 'https';

        return $scheme.'://'.$organization->subdomain.'.'.static::baseDomain().$path;
    }
}

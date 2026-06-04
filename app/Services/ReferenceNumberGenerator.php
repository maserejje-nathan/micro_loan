<?php

namespace App\Services;

use App\Support\OrganizationContext;
use Illuminate\Database\Eloquent\Model;

class ReferenceNumberGenerator
{
    public function generate(Model $model, string $prefix): string
    {
        $organizationId = $model->getAttribute('organization_id') ?? OrganizationContext::id();
        $count = $model->newQuery()
            ->when($organizationId, fn ($query) => $query->where('organization_id', $organizationId))
            ->count() + 1;

        return sprintf('%s-%s-%04d', $prefix, now()->format('Ym'), $count);
    }
}

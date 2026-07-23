<?php

namespace App\Http\Resources\Api\V1;

use App\Models\AuditLog;
use App\Support\AuditLogPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AuditLog
 */
class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return AuditLogPresenter::present($this->resource);
    }
}

<?php

namespace App\Models;

use App\Enums\MobileMoneyStatus;
use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MobileMoneyTransaction extends Model
{
    use BelongsToOrganization;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'type',
        'payable_type',
        'payable_id',
        'provider',
        'external_id',
        'phone',
        'amount',
        'status',
        'payload',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => MobileMoneyStatus::class,
            'payload' => 'array',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function payable(): MorphTo
    {
        return $this->morphTo();
    }
}

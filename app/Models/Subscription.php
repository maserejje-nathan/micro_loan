<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'subscription_plan_id',
        'status',
        'trial_ends_at',
        'starts_at',
        'ends_at',
        'current_period_start',
        'current_period_end',
        'canceled_at',
        'admin_notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'trial_ends_at' => 'datetime',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * @return BelongsTo<SubscriptionPlan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * @return HasMany<Invoice, $this>
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function isUsable(): bool
    {
        if (! $this->status->isUsable()) {
            return false;
        }

        if ($this->status === SubscriptionStatus::Trialing && $this->trial_ends_at?->isPast()) {
            return false;
        }

        if ($this->ends_at?->isPast()) {
            return false;
        }

        return true;
    }
}

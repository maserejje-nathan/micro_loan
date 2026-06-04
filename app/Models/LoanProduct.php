<?php

namespace App\Models;

use App\Enums\InterestType;
use App\Enums\RepaymentFrequency;
use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanProduct extends Model
{
    /** @use HasFactory<\Database\Factories\LoanProductFactory> */
    use BelongsToOrganization, HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'min_amount',
        'max_amount',
        'interest_rate',
        'interest_type',
        'term_min_days',
        'term_max_days',
        'repayment_frequency',
        'grace_period_days',
        'processing_fee',
        'is_active',
        'description',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'interest_rate' => 'decimal:4',
            'interest_type' => InterestType::class,
            'repayment_frequency' => RepaymentFrequency::class,
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<LoanApplication, $this>
     */
    public function loanApplications(): HasMany
    {
        return $this->hasMany(LoanApplication::class);
    }
}

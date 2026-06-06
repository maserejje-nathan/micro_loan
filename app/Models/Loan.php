<?php

namespace App\Models;

use App\Enums\InterestType;
use App\Enums\LoanStatus;
use App\Enums\RepaymentFrequency;
use App\Models\Concerns\BelongsToOrganization;
use Database\Factories\LoanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Loan extends Model
{
    /** @use HasFactory<LoanFactory> */
    use BelongsToOrganization, HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'loan_application_id',
        'customer_id',
        'loan_product_id',
        'reference_number',
        'principal',
        'interest_rate',
        'interest_type',
        'term_days',
        'repayment_frequency',
        'total_interest',
        'total_repayable',
        'outstanding_balance',
        'status',
        'disbursed_at',
        'closed_at',
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
            'status' => LoanStatus::class,
            'disbursed_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<LoanApplication, $this>
     */
    public function loanApplication(): BelongsTo
    {
        return $this->belongsTo(LoanApplication::class);
    }

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return BelongsTo<LoanProduct, $this>
     */
    public function loanProduct(): BelongsTo
    {
        return $this->belongsTo(LoanProduct::class);
    }

    /**
     * @return HasMany<LoanSchedule, $this>
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(LoanSchedule::class);
    }

    /**
     * @return HasMany<Repayment, $this>
     */
    public function repayments(): HasMany
    {
        return $this->hasMany(Repayment::class);
    }

    /**
     * @return HasOne<Disbursement, $this>
     */
    public function disbursement(): HasOne
    {
        return $this->hasOne(Disbursement::class);
    }
}

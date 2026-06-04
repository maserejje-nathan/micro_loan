<?php

namespace App\Models;

use App\Enums\ScheduleInstallmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanSchedule extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'loan_id',
        'installment_number',
        'due_date',
        'principal_amount',
        'interest_amount',
        'total_amount',
        'paid_amount',
        'status',
        'overdue_notified_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => ScheduleInstallmentStatus::class,
            'overdue_notified_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Loan, $this>
     */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * @return HasMany<Repayment, $this>
     */
    public function repayments(): HasMany
    {
        return $this->hasMany(Repayment::class);
    }

    public function remainingAmount(): int
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }
}

<?php

namespace App\Models;

use App\Enums\DisbursementStatus;
use App\Enums\PaymentChannel;
use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Disbursement extends Model
{
    use BelongsToOrganization;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'loan_id',
        'amount',
        'channel',
        'mobile_money_reference',
        'status',
        'disbursed_by',
        'disbursed_at',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'channel' => PaymentChannel::class,
            'status' => DisbursementStatus::class,
            'disbursed_at' => 'datetime',
            'metadata' => 'array',
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
     * @return BelongsTo<User, $this>
     */
    public function disburser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disbursed_by');
    }
}

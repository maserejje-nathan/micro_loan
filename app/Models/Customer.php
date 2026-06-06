<?php

namespace App\Models;

use App\Enums\CustomerEmploymentStatus;
use App\Enums\CustomerGender;
use App\Enums\CustomerIdType;
use App\Enums\CustomerStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Support\CustomerNotificationChannels;
use Database\Factories\CustomerFactory;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model implements AuthenticatableContract
{
    /** @use HasFactory<CustomerFactory> */
    use Authenticatable, BelongsToOrganization, HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'reference_number',
        'first_name',
        'last_name',
        'phone',
        'email',
        'payment_reminder_channels',
        'national_id',
        'date_of_birth',
        'gender',
        'nationality',
        'id_type',
        'id_expiry_date',
        'address',
        'district',
        'city',
        'occupation',
        'employment_status',
        'employer_name',
        'monthly_income',
        'next_of_kin_name',
        'next_of_kin_phone',
        'next_of_kin_relationship',
        'photo_path',
        'id_front_path',
        'id_back_path',
        'status',
        'metadata',
        'portal_enabled',
        'portal_password',
        'portal_enabled_at',
        'portal_last_login_at',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'portal_password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'gender' => CustomerGender::class,
            'id_type' => CustomerIdType::class,
            'id_expiry_date' => 'date',
            'employment_status' => CustomerEmploymentStatus::class,
            'monthly_income' => 'integer',
            'status' => CustomerStatus::class,
            'metadata' => 'array',
            'payment_reminder_channels' => 'array',
            'portal_enabled' => 'boolean',
            'portal_enabled_at' => 'datetime',
            'portal_last_login_at' => 'datetime',
        ];
    }

    public function getAuthPasswordName(): string
    {
        return 'portal_password';
    }

    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * @return list<string>
     */
    public function paymentReminderChannels(): array
    {
        if ($this->payment_reminder_channels === null) {
            return CustomerNotificationChannels::normalize(null);
        }

        return CustomerNotificationChannels::normalize($this->payment_reminder_channels);
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * @return HasMany<LoanApplication, $this>
     */
    public function loanApplications(): HasMany
    {
        return $this->hasMany(LoanApplication::class);
    }

    /**
     * @return HasMany<Loan, $this>
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }
}

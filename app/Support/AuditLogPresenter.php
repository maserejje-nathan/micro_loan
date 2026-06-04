<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\OrganizationInvitation;
use App\Models\Repayment;
class AuditLogPresenter
{
    /**
     * @var list<string>
     */
    public const CATEGORIES = [
        'customer',
        'loan_application',
        'loan',
        'loan_product',
        'repayment',
        'team',
    ];

    public static function actionLabel(string $action): string
    {
        return str($action)
            ->replace('.', ' ')
            ->replace('_', ' ')
            ->title()
            ->toString();
    }

    public static function category(string $action): string
    {
        return (string) str($action)->before('.');
    }

    /**
     * @return array<string, mixed>
     */
    public static function present(AuditLog $log): array
    {
        $entity = self::resolveEntity($log);

        return [
            'id' => $log->id,
            'action' => $log->action,
            'action_label' => self::actionLabel($log->action),
            'category' => self::category($log->action),
            'user_id' => $log->user_id,
            'user_name' => $log->user?->name ?? 'System',
            'entity_type' => $log->auditable_type ? class_basename($log->auditable_type) : null,
            'entity_id' => $log->auditable_id,
            'entity_label' => $entity['label'],
            'entity_url' => $entity['url'],
            'summary' => self::summary($log),
            'has_changes' => ! empty($log->old_values) || ! empty($log->new_values),
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'ip_address' => $log->ip_address,
            'created_at' => $log->created_at->toDateTimeString(),
        ];
    }

    /**
     * @return array{label: string|null, url: string|null}
     */
    protected static function resolveEntity(AuditLog $log): array
    {
        if (! $log->auditable_type || ! $log->auditable_id) {
            return ['label' => null, 'url' => null];
        }

        $model = $log->relationLoaded('auditable')
            ? $log->auditable
            : null;

        $type = class_basename($log->auditable_type);
        $id = $log->auditable_id;

        $label = match (true) {
            $model instanceof Customer => $model->reference_number,
            $model instanceof Loan => $model->reference_number,
            $model instanceof LoanApplication => $model->reference_number,
            $model instanceof Repayment => $model->reference_number,
            $model instanceof LoanProduct => "{$model->name} ({$model->code})",
            $model instanceof OrganizationInvitation => $model->email,
            default => "{$type} #{$id}",
        };

        $url = match ($type) {
            'Customer' => route('customers.show', $id),
            'Loan' => route('loans.show', $id),
            'LoanApplication' => route('loan-applications.show', $id),
            'LoanProduct' => route('loan-products.edit', $id),
            'Repayment' => $model instanceof Repayment
                ? route('loans.show', $model->loan_id)
                : null,
            'OrganizationInvitation' => route('settings.team.index'),
            default => null,
        };

        if ($type === 'Repayment' && $url === null) {
            $loanId = Repayment::query()->whereKey($id)->value('loan_id');
            if ($loanId) {
                $url = route('loans.show', $loanId);
            }
        }

        return ['label' => $label, 'url' => $url];
    }

    protected static function summary(AuditLog $log): ?string
    {
        if (! empty($log->new_values) && is_array($log->new_values)) {
            $keys = array_keys($log->new_values);

            if ($keys !== []) {
                return 'Updated: '.collect($keys)
                    ->map(fn (string $key) => str($key)->replace('_', ' ')->toString())
                    ->take(4)
                    ->join(', ');
            }
        }

        return match ($log->action) {
            'customer.created', 'loan_product.created', 'loan_application.created' => 'New record created',
            'loan_application.submitted' => 'Application submitted for review',
            'loan_application.approved' => 'Application approved',
            'loan_application.rejected' => 'Application rejected',
            'loan.disbursed' => 'Loan funds disbursed',
            'repayment.recorded' => 'Payment recorded',
            'team.invited' => 'Team invitation sent',
            'team.invitation_accepted' => 'Invitation accepted',
            'team.invitation_revoked' => 'Invitation revoked',
            default => null,
        };
    }

    /**
     * @return array<string, int>
     */
    public static function categoryCounts(): array
    {
        $counts = ['all' => AuditLog::query()->count()];

        foreach (self::CATEGORIES as $category) {
            $counts[$category] = AuditLog::query()
                ->where('action', 'like', "{$category}.%")
                ->count();
        }

        return $counts;
    }
}

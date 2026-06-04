<?php

namespace App\Jobs;

use App\Enums\LoanStatus;
use App\Enums\ScheduleInstallmentStatus;
use App\Models\LoanSchedule;
use App\Models\Organization;
use App\Services\PaymentReminderService;
use App\Support\OrganizationContext;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class ProcessOverdueInstallmentsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $organizationId) {}

    public function handle(PaymentReminderService $reminders): void
    {
        $organization = Organization::query()->find($this->organizationId);

        if ($organization === null) {
            return;
        }

        OrganizationContext::set($organization);

        $schedules = LoanSchedule::query()
            ->withoutGlobalScopes()
            ->whereHas('loan', function ($query) use ($organization) {
                $query->where('organization_id', $organization->id)
                    ->where('status', LoanStatus::Active);
            })
            ->whereIn('status', [
                ScheduleInstallmentStatus::Pending,
                ScheduleInstallmentStatus::Partial,
            ])
            ->whereDate('due_date', '<', now()->toDateString())
            ->with(['loan.customer'])
            ->get();

        foreach ($schedules as $schedule) {
            DB::transaction(function () use ($schedule, $reminders) {
                if ($schedule->status !== ScheduleInstallmentStatus::Overdue) {
                    $schedule->update(['status' => ScheduleInstallmentStatus::Overdue]);
                }

                if ($schedule->overdue_notified_at !== null
                    && $schedule->overdue_notified_at->isToday()) {
                    return;
                }

                $result = $reminders->sendForSchedule($schedule, markNotified: true);

                if (! $result->ok) {
                    return;
                }
            });
        }

        OrganizationContext::clear();
    }
}

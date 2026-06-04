<?php

namespace App\Console\Commands;

use App\Jobs\ProcessOverdueInstallmentsJob;
use App\Models\Organization;
use Illuminate\Console\Command;

class ProcessOverdueInstallmentsCommand extends Command
{
    protected $signature = 'loans:process-overdue';

    protected $description = 'Mark overdue installments and send reminder SMS for all organizations';

    public function handle(): int
    {
        $count = 0;

        Organization::query()->pluck('id')->each(function (int $organizationId) use (&$count) {
            ProcessOverdueInstallmentsJob::dispatch($organizationId);
            $count++;
        });

        $this->info("Dispatched overdue processing for {$count} organization(s).");

        return self::SUCCESS;
    }
}

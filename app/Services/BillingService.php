<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Support\Str;

class BillingService
{
    public function createSubscriptionInvoice(Subscription $subscription): Invoice
    {
        $subscription->load('plan', 'organization');
        $plan = $subscription->plan;

        return Invoice::query()->create([
            'organization_id' => $subscription->organization_id,
            'subscription_id' => $subscription->id,
            'invoice_number' => $this->generateInvoiceNumber(),
            'amount' => $plan->price,
            'currency' => $plan->currency,
            'status' => InvoiceStatus::Open,
            'description' => "{$plan->name} subscription ({$plan->billing_interval->value})",
            'period_start' => $subscription->current_period_start?->toDateString(),
            'period_end' => $subscription->current_period_end?->toDateString(),
            'due_at' => now()->addDays(7),
        ]);
    }

    public function createManualInvoice(
        Organization $organization,
        int $amount,
        string $description,
        ?Subscription $subscription = null,
    ): Invoice {
        return Invoice::query()->create([
            'organization_id' => $organization->id,
            'subscription_id' => $subscription?->id,
            'invoice_number' => $this->generateInvoiceNumber(),
            'amount' => $amount,
            'currency' => $organization->currency,
            'status' => InvoiceStatus::Open,
            'description' => $description,
            'due_at' => now()->addDays(7),
        ]);
    }

    public function markPaid(Invoice $invoice): Invoice
    {
        $invoice->update([
            'status' => InvoiceStatus::Paid,
            'paid_at' => now(),
        ]);

        return $invoice->fresh();
    }

    public function markOverdueInvoices(): int
    {
        return Invoice::query()
            ->where('status', InvoiceStatus::Open)
            ->where('due_at', '<', now())
            ->update(['status' => InvoiceStatus::Overdue]);
    }

    protected function generateInvoiceNumber(): string
    {
        do {
            $number = 'INV-'.now()->format('Ym').'-'.Str::upper(Str::random(6));
        } while (Invoice::query()->where('invoice_number', $number)->exists());

        return $number;
    }
}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Loan Statement {{ $loan->reference_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        th { background: #f5f5f5; }
        .meta { margin-bottom: 16px; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <h1>{{ $organization->name }}</h1>
    <p class="meta">Loan statement · Generated {{ $generated_at->format('d M Y H:i') }}</p>

    <h2>Loan details</h2>
    <table>
        <tr><th>Reference</th><td>{{ $loan->reference_number }}</td></tr>
        <tr><th>Customer</th><td>{{ $customer->fullName() }}</td></tr>
        <tr><th>Phone</th><td>{{ $customer->phone }}</td></tr>
        <tr><th>Principal</th><td>{{ number_format($loan->principal) }} {{ $organization->currency }}</td></tr>
        <tr><th>Total repayable</th><td>{{ number_format($loan->total_repayable) }} {{ $organization->currency }}</td></tr>
        <tr><th>Outstanding</th><td>{{ number_format($loan->outstanding_balance) }} {{ $organization->currency }}</td></tr>
        <tr><th>Status</th><td>{{ $loan->status->value }}</td></tr>
    </table>

    <h2>Repayment schedule</h2>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Due date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($schedules as $schedule)
                <tr>
                    <td>{{ $schedule->installment_number }}</td>
                    <td>{{ $schedule->due_date->format('d M Y') }}</td>
                    <td class="right">{{ number_format($schedule->total_amount) }}</td>
                    <td class="right">{{ number_format($schedule->paid_amount) }}</td>
                    <td>{{ $schedule->status->value }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Payments received</h2>
    <table>
        <thead>
            <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Channel</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($repayments as $repayment)
                <tr>
                    <td>{{ $repayment->reference_number }}</td>
                    <td>{{ $repayment->paid_at->format('d M Y H:i') }}</td>
                    <td class="right">{{ number_format($repayment->amount) }}</td>
                    <td>{{ $repayment->channel->value }}</td>
                </tr>
            @empty
                <tr><td colspan="4">No repayments recorded yet.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>

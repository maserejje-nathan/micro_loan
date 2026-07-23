import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    Calendar,
    Download,
    HandCoins,
    Percent,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import { PaymentChannelBadge } from '@/components/payment-channel-badge';
import { PortalPage } from '@/components/portal/portal-page';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type ScheduleRow = {
    installment_number: number;
    due_date: string;
    total_amount: number;
    paid_amount: number;
    status: string;
};

type RepaymentRow = {
    reference_number: string;
    amount: number;
    paid_at: string;
    channel: string;
};

type Props = {
    loan: {
        id: number;
        reference_number: string;
        principal: number;
        total_interest: number;
        total_repayable: number;
        outstanding_balance: number;
        total_repaid: number;
        repayment_progress: number;
        status: string;
        term_days: number;
        interest_rate: number;
        interest_type: string;
        repayment_frequency: string;
        disbursed_at: string | null;
        closed_at: string | null;
        product_name: string;
        product_code: string;
    };
    scheduleSummary: {
        total: number;
        paid: number;
        overdue: number;
        next_due: {
            installment_number: number;
            due_date: string;
            remaining_amount: number;
        } | null;
    };
    schedules: Paginated<ScheduleRow>;
    repayments: Paginated<RepaymentRow>;
    currency: string;
    statementUrl: string;
};

function formatDate(date: string | null): string {
    if (!date) {
        return '—';
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    if (!value) {
        return null;
    }

    return (
        <div className="rounded-none border border-border bg-muted px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{value}</dd>
        </div>
    );
}

export default function PortalLoanShow({
    loan,
    scheduleSummary,
    schedules,
    repayments,
    currency,
    statementUrl,
}: Props) {
    const nextDue = scheduleSummary.next_due;

    return (
        <>
            <Head title={loan.reference_number} />
            <PortalPage>
                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
                                    {loan.reference_number}
                                </h1>
                                <EntityStatusBadge
                                    status={loan.status}
                                    type="loan"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {loan.product_name}{' '}
                                <span className="font-mono text-xs">
                                    ({loan.product_code})
                                </span>
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="size-3.5" />
                                    {loan.term_days} day term
                                </span>
                                {loan.disbursed_at && (
                                    <span>
                                        Disbursed{' '}
                                        {formatDate(loan.disbursed_at)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            asChild
                            className="w-full shrink-0 sm:w-auto"
                        >
                            <a
                                href={statementUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Download className="mr-2 size-4" />
                                Download statement
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Principal"
                        value={formatMoney(loan.principal, currency)}
                        description="Amount disbursed"
                        icon={Wallet}
                    />
                    <StatCard
                        title="Outstanding"
                        value={formatMoney(loan.outstanding_balance, currency)}
                        description="Remaining balance"
                        icon={Banknote}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Total repayable"
                        value={formatMoney(loan.total_repayable, currency)}
                        description={`${formatMoney(loan.total_interest, currency)} interest`}
                        icon={Percent}
                    />
                    <StatCard
                        title="Repaid"
                        value={formatMoney(loan.total_repaid, currency)}
                        description={`${loan.repayment_progress}% of total`}
                        icon={TrendingUp}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                {loan.repayment_progress > 0 && loan.status === 'active' && (
                    <div className="space-y-2 rounded-none border bg-card p-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">
                                Repayment progress
                            </span>
                            <span className="text-muted-foreground">
                                {loan.repayment_progress}% complete
                            </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${Math.min(100, loan.repayment_progress)}%`,
                                }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatMoney(loan.total_repaid, currency)} repaid of{' '}
                            {formatMoney(loan.total_repayable, currency)}
                        </p>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Loan terms
                            </CardTitle>
                            <CardDescription>
                                Product and schedule configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailItem
                                    label="Term"
                                    value={`${loan.term_days} days`}
                                />
                                <DetailItem
                                    label="Repayment frequency"
                                    value={formatEnumLabel(
                                        loan.repayment_frequency,
                                    )}
                                />
                                <DetailItem
                                    label="Interest rate"
                                    value={`${loan.interest_rate}% ${formatEnumLabel(loan.interest_type)}`}
                                />
                                <DetailItem
                                    label="Disbursed"
                                    value={
                                        loan.disbursed_at
                                            ? formatDate(loan.disbursed_at)
                                            : null
                                    }
                                />
                                <DetailItem
                                    label="Closed"
                                    value={
                                        loan.closed_at
                                            ? formatDate(loan.closed_at)
                                            : null
                                    }
                                />
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Schedule summary
                            </CardTitle>
                            <CardDescription>
                                {scheduleSummary.total} installments
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-6 pt-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Paid
                                </p>
                                <p className="text-2xl font-semibold">
                                    {scheduleSummary.paid}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Overdue
                                </p>
                                <p
                                    className={cn(
                                        'text-2xl font-semibold',
                                        scheduleSummary.overdue > 0 &&
                                            'text-destructive',
                                    )}
                                >
                                    {scheduleSummary.overdue}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Remaining
                                </p>
                                <p className="text-2xl font-semibold">
                                    {scheduleSummary.total -
                                        scheduleSummary.paid}
                                </p>
                            </div>
                            {nextDue && (
                                <div className="w-full border-t pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Next due
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(nextDue.due_date)} ·{' '}
                                        {formatMoney(
                                            nextDue.remaining_amount,
                                            currency,
                                        )}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-5 text-primary" />
                            <div>
                                <CardTitle className="text-base">
                                    Repayment schedule
                                </CardTitle>
                                <CardDescription>
                                    Installment due dates and status
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {schedules.data.length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground">
                                No schedule generated yet.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Due date</TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Paid
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.data.map((row) => (
                                        <TableRow
                                            key={row.installment_number}
                                            className={cn(
                                                row.status === 'overdue' &&
                                                    'bg-destructive/5',
                                            )}
                                        >
                                            <TableCell>
                                                {row.installment_number}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(row.due_date)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(
                                                    row.total_amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(
                                                    row.paid_amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <EntityStatusBadge
                                                    status={row.status}
                                                    type="schedule"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={schedules} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                        <div className="flex items-center gap-2">
                            <HandCoins className="size-5 text-primary" />
                            <div>
                                <CardTitle className="text-base">
                                    Repayment history
                                </CardTitle>
                                <CardDescription>
                                    {paginatorTotal(repayments)} payment
                                    {paginatorTotal(repayments) === 1
                                        ? ''
                                        : 's'}{' '}
                                    recorded
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {repayments.data.length === 0 ? (
                            <EmptyState
                                icon={HandCoins}
                                title="No repayments yet"
                                description="Payments will appear here once your lender records them."
                                className="m-4 border-0 bg-transparent py-12"
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Channel</TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {repayments.data.map((row) => (
                                        <TableRow key={row.reference_number}>
                                            <TableCell className="font-mono text-sm">
                                                {row.reference_number}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(row.paid_at)}
                                            </TableCell>
                                            <TableCell>
                                                <PaymentChannelBadge
                                                    channel={row.channel}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatMoney(
                                                    row.amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={repayments} />
                    </CardContent>
                </Card>

                <div className="flex justify-start">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/portal/loans">← Back to my loans</Link>
                    </Button>
                </div>
            </PortalPage>
        </>
    );
}

PortalLoanShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Overview', href: '/portal' },
        { title: 'My loans', href: '/portal/loans' },
        {
            title: props.loan.reference_number,
            href: `/portal/loans/${props.loan.id}`,
        },
    ],
});

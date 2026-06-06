import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    Plus,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { PaymentChannelBadge } from '@/components/payment-channel-badge';
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
import { formatMoney } from '@/lib/format-money';
import { show as customerShow } from '@/routes/customers';
import { show as loanShow } from '@/routes/loans';
import { create, index as repaymentsIndex } from '@/routes/repayments';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type Repayment = {
    id: number;
    reference_number: string;
    loan_id: number;
    loan_reference: string;
    customer_id: number;
    customer_name: string;
    amount: number;
    channel: string;
    mobile_money_reference: string | null;
    paid_at: string;
};

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function RepaymentsIndex({
    repayments,
    currency,
    stats,
    canRecordRepayment,
}: {
    repayments: Paginated<Repayment>;
    currency: string;
    stats: {
        total: number;
        total_collected: number;
        collected_this_month: number;
        active_loans: number;
    };
    canRecordRepayment: boolean;
}) {
    const total = paginatorTotal(repayments);

    return (
        <>
            <Head title="Repayments" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Repayments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Payment history and collections across your portfolio
                        </p>
                    </div>
                    {canRecordRepayment && (
                        <Button asChild>
                            <Link href={create().url}>
                                <Plus className="mr-2 size-4" />
                                Record payment
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total payments"
                        value={String(stats.total)}
                        description="All recorded repayments"
                        icon={Wallet}
                    />
                    <StatCard
                        title="Collected (all time)"
                        value={formatMoney(stats.total_collected, currency)}
                        description="Sum of payment amounts"
                        icon={Banknote}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        title="This month"
                        value={formatMoney(
                            stats.collected_this_month,
                            currency,
                        )}
                        description="Collections since month start"
                        icon={CalendarDays}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="Loans to collect"
                        value={String(stats.active_loans)}
                        description="Active loans with balance due"
                        icon={TrendingUp}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        href={
                            canRecordRepayment ? create().url : undefined
                        }
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Payment history</CardTitle>
                        <CardDescription>
                            {total} {total === 1 ? 'payment' : 'payments'} ·
                            amounts in {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {repayments.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Banknote}
                                    title="No repayments yet"
                                    description="Payments appear here once you record them against active loans."
                                    action={
                                        canRecordRepayment ? (
                                            <Button asChild>
                                                <Link href={create().url}>
                                                    Record payment
                                                </Link>
                                            </Button>
                                        ) : undefined
                                    }
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Loan</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Customer
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell">
                                            Channel
                                        </TableHead>
                                        <TableHead className="hidden xl:table-cell">
                                            Paid at
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {repayments.data.map((repayment) => (
                                        <TableRow key={repayment.id}>
                                            <TableCell>
                                                <p className="font-mono text-sm font-medium">
                                                    {repayment.reference_number}
                                                </p>
                                                {repayment.mobile_money_reference && (
                                                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                        {
                                                            repayment.mobile_money_reference
                                                        }
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={loanShow.url(
                                                        repayment.loan_id,
                                                    )}
                                                    className="font-mono text-sm hover:underline"
                                                >
                                                    {repayment.loan_reference}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Link
                                                    href={customerShow.url(
                                                        repayment.customer_id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {repayment.customer_name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <PaymentChannelBadge
                                                    channel={repayment.channel}
                                                />
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                                                {formatDateTime(
                                                    repayment.paid_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatMoney(
                                                    repayment.amount,
                                                    currency,
                                                )}
                                                <p className="text-xs font-normal text-muted-foreground lg:hidden">
                                                    {formatDateTime(
                                                        repayment.paid_at,
                                                    )}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={loanShow.url(
                                                            repayment.loan_id,
                                                        )}
                                                    >
                                                        View loan
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={repayments} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RepaymentsIndex.layout = {
    breadcrumbs: [{ title: 'Repayments', href: repaymentsIndex().url }],
};

import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Coins,
    FileDown,
    FileText,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { MonthlyTrendCard } from '@/components/reports/monthly-trend-card';
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
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type Portfolio = {
    active_loans: number;
    total_disbursed: number;
    outstanding: number;
    collected_this_month: number;
    overdue_installments: number;
};

type StatementLoan = {
    id: number;
    reference_number: string;
    customer_name: string;
    statement_url: string;
};

export default function ReportsIndex({
    currency,
    portfolio,
    statementLoans,
    disbursementsByMonth,
    repaymentsByMonth,
}: {
    currency: string;
    portfolio: Portfolio;
    statementLoans: Paginated<StatementLoan>;
    disbursementsByMonth: Record<string, number>;
    repaymentsByMonth: Record<string, number>;
}) {
    const hasOverdue = portfolio.overdue_installments > 0;

    return (
        <>
            <Head title="Reports" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Reports
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Portfolio performance, collections, and loan
                            statements
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm">
                        <BarChart3 className="size-4 text-primary" />
                        <span className="text-muted-foreground">Currency:</span>
                        <span className="font-medium">{currency}</span>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Active loans"
                        value={String(portfolio.active_loans)}
                        description="Currently disbursed and open"
                        icon={Wallet}
                        href="/loans"
                    />
                    <StatCard
                        title="Total disbursed"
                        value={formatMoney(portfolio.total_disbursed, currency)}
                        description="Lifetime principal funded"
                        icon={ArrowUpRight}
                        accentClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    />
                    <StatCard
                        title="Outstanding"
                        value={formatMoney(portfolio.outstanding, currency)}
                        description="Balance still to be collected"
                        icon={TrendingUp}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="Collected (MTD)"
                        value={formatMoney(
                            portfolio.collected_this_month,
                            currency,
                        )}
                        description="Repayments this calendar month"
                        icon={Coins}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                <Card
                    className={cn(
                        hasOverdue &&
                            'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10',
                    )}
                >
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div
                                className={cn(
                                    'flex size-10 shrink-0 items-center justify-center rounded-lg',
                                    hasOverdue
                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                <AlertTriangle className="size-5" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    Overdue installments
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {hasOverdue
                                        ? 'Follow up on past-due schedules to reduce portfolio risk.'
                                        : 'No overdue installments — portfolio is on track.'}
                                </p>
                            </div>
                        </div>
                        <p
                            className={cn(
                                'text-3xl font-semibold tabular-nums',
                                hasOverdue
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {portfolio.overdue_installments}
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <MonthlyTrendCard
                        title="Disbursements by month"
                        description="Principal funded per calendar month"
                        data={disbursementsByMonth}
                        currency={currency}
                        barClassName="bg-sky-500"
                        emptyMessage="No disbursements recorded yet."
                    />
                    <MonthlyTrendCard
                        title="Collections by month"
                        description="Repayments received per calendar month"
                        data={repaymentsByMonth}
                        currency={currency}
                        barClassName="bg-emerald-500"
                        emptyMessage="No repayments recorded yet."
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="size-5 text-primary" />
                                <div>
                                    <CardTitle>PDF loan statements</CardTitle>
                                    <CardDescription>
                                        Download statements for active and
                                        closed loans
                                    </CardDescription>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {paginatorTotal(statementLoans)} available
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {statementLoans.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={FileDown}
                                    title="No statements available"
                                    description="Statements appear after loans are disbursed and closed."
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Loan</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="text-right">
                                            Statement
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {statementLoans.data.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/loans/${loan.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {loan.reference_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {loan.customer_name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a
                                                        href={
                                                            loan.statement_url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <FileDown className="mr-1.5 size-4" />
                                                        Download PDF
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={statementLoans} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [{ title: 'Reports', href: '/reports' }],
};

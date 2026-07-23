import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    CheckCircle2,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
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
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';
import { index as loansIndex } from '@/routes/portal/loans';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type LoanRow = {
    id: number;
    reference_number: string;
    product_name: string;
    principal: number;
    total_repayable: number;
    outstanding_balance: number;
    total_repaid: number;
    repayment_progress: number;
    status: string;
    disbursed_at: string | null;
};

type Filter = 'all' | 'active' | 'closed';

function filterUrl(filter: Filter): string {
    if (filter === 'all') {
        return loansIndex.url();
    }

    return loansIndex.url({ query: { filter } });
}

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

function LoanProgress({ progress }: { progress: number }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Repaid</span>
                <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, progress)}%` }}
                />
            </div>
        </div>
    );
}

export default function PortalLoansIndex({
    loans,
    filter,
    currency,
    stats,
}: {
    loans: Paginated<LoanRow>;
    filter: Filter;
    currency: string;
    stats: {
        total: number;
        active: number;
        closed: number;
        outstanding: number;
        total_repaid: number;
    };
}) {
    const filters: { key: Filter; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: stats.total },
        { key: 'active', label: 'Active', count: stats.active },
        { key: 'closed', label: 'Completed', count: stats.closed },
    ];

    return (
        <>
            <Head title="My loans" />
            <PortalPage>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        My loans
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track balances, installments, and download statements.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total loans"
                        value={String(stats.total)}
                        description="All accounts on file"
                        icon={Wallet}
                    />
                    <StatCard
                        title="Active"
                        value={String(stats.active)}
                        description="Currently running"
                        icon={TrendingUp}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        title="Outstanding"
                        value={formatMoney(stats.outstanding, currency)}
                        description="On active loans"
                        icon={Banknote}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="Total repaid"
                        value={formatMoney(stats.total_repaid, currency)}
                        description="Lifetime repayments"
                        icon={CheckCircle2}
                        accentClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    />
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-5 text-primary" />
                            <div>
                                <CardTitle className="text-base">
                                    Your loans
                                </CardTitle>
                                <CardDescription>
                                    {paginatorTotal(loans)} of {stats.total}{' '}
                                    loan{stats.total === 1 ? '' : 's'} shown
                                </CardDescription>
                            </div>
                        </div>
                        <div className="w-full overflow-x-auto overscroll-x-contain">
                            <div className="flex w-max min-w-full gap-1 rounded-none border border-border bg-muted p-1 sm:w-full sm:flex-wrap">
                                {filters.map((item) => (
                                    <Link
                                        key={item.key}
                                        href={filterUrl(item.key)}
                                        preserveScroll
                                        preserveState
                                        className={cn(
                                            'inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors',
                                            filter === item.key
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        {item.label}
                                        <span className="ml-1.5 text-xs text-muted-foreground">
                                            {item.count}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loans.data.length === 0 ? (
                            <EmptyState
                                icon={Wallet}
                                title={
                                    filter === 'all'
                                        ? 'No loans yet'
                                        : `No ${filter} loans`
                                }
                                description={
                                    filter === 'all'
                                        ? 'When your lender disburses a loan to you, it will appear here.'
                                        : 'Try another filter to see your other loans.'
                                }
                                className="m-4 border-0 bg-transparent py-12"
                                action={
                                    filter !== 'all' ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={filterUrl('all')}>
                                                Show all loans
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <div className="grid gap-4 p-4 lg:hidden">
                                    {loans.data.map((loan) => (
                                        <Link
                                            key={loan.id}
                                            href={`/portal/loans/${loan.id}`}
                                            className="block rounded-none border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">
                                                        {loan.reference_number}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {loan.product_name}
                                                    </p>
                                                </div>
                                                <EntityStatusBadge
                                                    status={loan.status}
                                                    type="loan"
                                                />
                                            </div>
                                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Outstanding
                                                    </p>
                                                    <p className="font-medium tabular-nums">
                                                        {formatMoney(
                                                            loan.outstanding_balance,
                                                            currency,
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Disbursed
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatDate(
                                                            loan.disbursed_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {loan.status === 'active' &&
                                                loan.repayment_progress > 0 && (
                                                    <div className="mt-4">
                                                        <LoanProgress
                                                            progress={
                                                                loan.repayment_progress
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            <p className="mt-3 flex items-center text-sm font-medium text-primary">
                                                View loan
                                                <ArrowRight className="ml-1 size-4" />
                                            </p>
                                        </Link>
                                    ))}
                                </div>

                                <div className="hidden lg:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Disbursed</TableHead>
                                                <TableHead className="text-right">
                                                    Outstanding
                                                </TableHead>
                                                <TableHead>Progress</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-10" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loans.data.map((loan) => (
                                                <TableRow key={loan.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/portal/loans/${loan.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {
                                                                loan.reference_number
                                                            }
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {loan.product_name}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {formatDate(
                                                            loan.disbursed_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">
                                                        {formatMoney(
                                                            loan.outstanding_balance,
                                                            currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="min-w-[120px]">
                                                        {loan.status ===
                                                            'active' &&
                                                        loan.repayment_progress >
                                                            0 ? (
                                                            <LoanProgress
                                                                progress={
                                                                    loan.repayment_progress
                                                                }
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <EntityStatusBadge
                                                            status={loan.status}
                                                            type="loan"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/portal/loans/${loan.id}`}
                                                            >
                                                                <ArrowRight className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                        <DataTablePagination paginator={loans} />
                    </CardContent>
                </Card>
            </PortalPage>
        </>
    );
}

PortalLoansIndex.layout = {
    breadcrumbs: [
        { title: 'Overview', href: '/portal' },
        { title: 'My loans', href: '/portal/loans' },
    ],
};

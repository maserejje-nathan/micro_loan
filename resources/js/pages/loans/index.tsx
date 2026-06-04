import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    Clock,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
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

type Loan = {
    id: number;
    reference_number: string;
    customer_id: number;
    customer_name: string;
    product_name: string;
    product_code: string;
    principal: number;
    total_repayable: number;
    outstanding_balance: number;
    term_days: number;
    status: string;
    disbursed_at: string | null;
};

function formatDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function LoansIndex({
    loans,
    currency,
    stats,
}: {
    loans: Paginated<Loan>;
    currency: string;
    stats: {
        total: number;
        active: number;
        pending_disbursement: number;
        outstanding: number;
    };
}) {
    const total = paginatorTotal(loans);

    return (
        <>
            <Head title="Loans" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Loans
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Disbursed portfolio, balances, and repayment status
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total loans"
                        value={String(stats.total)}
                        description="All loans in the system"
                        icon={Wallet}
                    />
                    <StatCard
                        title="Active"
                        value={String(stats.active)}
                        description="Currently accruing repayments"
                        icon={TrendingUp}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        title="Pending disbursement"
                        value={String(stats.pending_disbursement)}
                        description="Approved, awaiting payout"
                        icon={Clock}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Outstanding"
                        value={formatMoney(stats.outstanding, currency)}
                        description="Balance on active loans"
                        icon={Banknote}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Portfolio</CardTitle>
                        <CardDescription>
                            {total} {total === 1 ? 'loan' : 'loans'} · amounts
                            in {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loans.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Wallet}
                                    title="No loans yet"
                                    description="Loans are created when you approve loan applications and disburse funds."
                                    action={
                                        <Button variant="outline" asChild>
                                            <Link href="/loan-applications">
                                                View applications
                                            </Link>
                                        </Button>
                                    }
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Product
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell text-right">
                                            Term
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Principal
                                        </TableHead>
                                        <TableHead className="hidden sm:table-cell text-right">
                                            Outstanding
                                        </TableHead>
                                        <TableHead className="hidden xl:table-cell">
                                            Disbursed
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loans.data.map((loan) => (
                                        <TableRow
                                            key={loan.id}
                                            className={cn(
                                                loan.status === 'closed' &&
                                                    'opacity-70',
                                            )}
                                        >
                                            <TableCell>
                                                <Link
                                                    href={`/loans/${loan.id}`}
                                                    className="font-mono text-sm font-medium hover:underline"
                                                >
                                                    {loan.reference_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/customers/${loan.customer_id}`}
                                                    className="hover:underline"
                                                >
                                                    {loan.customer_name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <p className="text-sm">
                                                    {loan.product_name}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {loan.product_code}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                                                {loan.term_days} days
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatMoney(
                                                    loan.principal,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden text-right sm:table-cell">
                                                <span
                                                    className={cn(
                                                        'font-medium',
                                                        loan.outstanding_balance >
                                                            0 &&
                                                            'text-amber-600 dark:text-amber-400',
                                                        loan.outstanding_balance ===
                                                            0 &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {formatMoney(
                                                        loan.outstanding_balance,
                                                        currency,
                                                    )}
                                                </span>
                                                {loan.outstanding_balance >
                                                    0 &&
                                                    loan.outstanding_balance <
                                                        loan.total_repayable && (
                                                        <p className="text-xs text-muted-foreground">
                                                            of{' '}
                                                            {formatMoney(
                                                                loan.total_repayable,
                                                                currency,
                                                            )}
                                                        </p>
                                                    )}
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                                                {loan.disbursed_at
                                                    ? formatDate(
                                                          loan.disbursed_at,
                                                      )
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <EntityStatusBadge
                                                    status={loan.status}
                                                    type="loan"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/loans/${loan.id}`}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={loans} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LoansIndex.layout = {
    breadcrumbs: [{ title: 'Loans', href: '/loans' }],
};

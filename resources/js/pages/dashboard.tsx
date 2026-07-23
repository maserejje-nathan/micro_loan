import { Head, Link, usePage } from '@inertiajs/react';
import {
    Check,
    ClipboardCopy,
    ClipboardList,
    Coins,
    FileText,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import { LoanCalculatorWidget } from '@/components/loan-calculator/loan-calculator-widget';
import type { LoanCalculatorConfig } from '@/components/loan-calculator/loan-calculator-widget';
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
import { useClipboard } from '@/hooks/use-clipboard';
import { formatMoney } from '@/lib/format-money';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/customers';
import { index as loanApplicationsIndex } from '@/routes/loan-applications';
import { index as loansIndex } from '@/routes/loans';
import { index as repaymentsIndex } from '@/routes/repayments';

type Stats = {
    active_loans: number;
    pending_applications: number;
    total_customers: number;
    portfolio_outstanding: number;
    repayments_this_month: number;
};

type Application = {
    id: number;
    reference_number: string;
    customer_name: string;
    product_name: string;
    requested_amount: number;
    status: string;
};

export default function Dashboard({
    stats,
    recentApplications,
    currency,
    loanCalculator,
}: {
    stats: Stats;
    recentApplications: Application[];
    currency: string;
    loanCalculator: LoanCalculatorConfig;
}) {
    const { auth, tenancy } = usePage().props as {
        auth?: {
            organization?: { name: string; slug: string } | null;
        };
        tenancy?: { subdomain_enabled: boolean };
    };
    const [copiedCode, copyLenderCode] = useClipboard();
    const lenderCode = auth?.organization?.slug;
    const showLenderCode = lenderCode && tenancy?.subdomain_enabled !== true;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-5 px-3 pb-10 sm:gap-6 sm:px-4">
                <div className="space-y-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Portfolio overview and recent activity
                        </p>
                    </div>
                    {showLenderCode && (
                        <div className="flex flex-wrap items-center gap-2 rounded-none border border-border bg-muted px-3 py-3 sm:px-4">
                            <span className="text-sm font-medium">
                                Client portal lender code
                            </span>
                            <code className="rounded-md border bg-background px-2.5 py-1 font-mono text-sm">
                                {lenderCode}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => copyLenderCode(lenderCode)}
                            >
                                {copiedCode === lenderCode ? (
                                    <>
                                        <Check className="mr-1.5 size-3.5" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCopy className="mr-1.5 size-3.5" />
                                        Copy
                                    </>
                                )}
                            </Button>
                            <p className="w-full text-xs text-muted-foreground">
                                Customers enter this code when signing in or
                                registering on the main portal URL.
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
                    <StatCard
                        title="Active loans"
                        value={String(stats.active_loans)}
                        description="Currently accruing"
                        icon={Wallet}
                        href={loansIndex().url}
                        tone="blue"
                    />
                    <StatCard
                        title="Pending applications"
                        value={String(stats.pending_applications)}
                        description="Awaiting review"
                        icon={ClipboardList}
                        href={loanApplicationsIndex().url}
                        tone="amber"
                    />
                    <StatCard
                        title="Customers"
                        value={String(stats.total_customers)}
                        description="Borrowers on file"
                        icon={Users}
                        href={customersIndex().url}
                        tone="sky"
                    />
                    <StatCard
                        title="Outstanding portfolio"
                        value={formatMoney(
                            stats.portfolio_outstanding,
                            currency,
                        )}
                        description="Balance on active loans"
                        icon={TrendingUp}
                        href={loansIndex().url}
                        tone="violet"
                    />
                    <StatCard
                        title="Collected this month"
                        value={formatMoney(
                            stats.repayments_this_month,
                            currency,
                        )}
                        description="Repayments received"
                        icon={Coins}
                        href={repaymentsIndex().url}
                        tone="emerald"
                        className="sm:col-span-2 xl:col-span-1"
                    />
                </div>

                <LoanCalculatorWidget config={loanCalculator} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                        <div className="flex items-center gap-2">
                            <FileText className="size-5 text-primary" />
                            <div>
                                <CardTitle>Recent applications</CardTitle>
                                <CardDescription>
                                    Latest loan requests across your portfolio
                                </CardDescription>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={loanApplicationsIndex().url}>
                                View all
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentApplications.length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground">
                                No applications yet.{' '}
                                <Link
                                    href="/loan-applications/create"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    Create one
                                </Link>
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Product
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentApplications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/loan-applications/${app.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {app.reference_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {app.customer_name}
                                            </TableCell>
                                            <TableCell className="hidden text-muted-foreground md:table-cell">
                                                {app.product_name}
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatMoney(
                                                    app.requested_amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <EntityStatusBadge
                                                    status={app.status}
                                                    type="loan_application"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};

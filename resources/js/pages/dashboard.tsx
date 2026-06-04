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
import { useClipboard } from '@/hooks/use-clipboard';
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
import {
    LoanCalculatorWidget,
    type LoanCalculatorConfig,
} from '@/components/loan-calculator/loan-calculator-widget';
import { formatMoney } from '@/lib/format-money';
import { dashboard } from '@/routes';

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
    const showLenderCode =
        lenderCode && tenancy?.subdomain_enabled !== true;

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
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted px-3 py-3 sm:px-4">
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

               

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        title="Active loans"
                        value={String(stats.active_loans)}
                        icon={Wallet}
                        href="/loans"
                    />
                    <StatCard
                        title="Pending applications"
                        value={String(stats.pending_applications)}
                        icon={ClipboardList}
                        href="/loan-applications"
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Customers"
                        value={String(stats.total_customers)}
                        icon={Users}
                        href="/customers"
                        accentClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    />
                    <StatCard
                        title="Outstanding portfolio"
                        value={formatMoney(
                            stats.portfolio_outstanding,
                            currency,
                        )}
                        icon={TrendingUp}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="Collected this month"
                        value={formatMoney(
                            stats.repayments_this_month,
                            currency,
                        )}
                        icon={Coins}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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
                            <Link href="/loan-applications">View all</Link>
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
                                            <TableCell className="text-right font-medium">
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

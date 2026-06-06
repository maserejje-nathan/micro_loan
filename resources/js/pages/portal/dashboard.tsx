import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    ClipboardList,
    ClipboardCopy,
    FileText,
    Plus,
    TrendingUp,
    User,
    Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import {
    LoanCalculatorWidget
    
} from '@/components/loan-calculator/loan-calculator-widget';
import type {LoanCalculatorConfig} from '@/components/loan-calculator/loan-calculator-widget';
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
import { useClipboard } from '@/hooks/use-clipboard';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';

type Props = {
    portal: {
        enabled: boolean;
        allow_applications: boolean;
        welcome_message: string;
    };
    stats: {
        active_loans: number;
        outstanding: number;
        pending_applications: number;
        draft_applications: number;
    };
    recentLoans: {
        id: number;
        reference_number: string;
        product_name: string;
        outstanding_balance: number;
        status: string;
    }[];
    recentApplications: {
        id: number;
        reference_number: string;
        product_name: string;
        requested_amount: number;
        status: string;
        created_at: string;
    }[];
    currency: string;
};

type PortalAuth = {
    customer?: { name: string };
    organization?: { name: string; slug: string };
};

type TenancyProps = {
    subdomain_enabled: boolean;
};

function QuickLinkCard({
    title,
    description,
    href,
    icon: Icon,
}: {
    title: string;
    description: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
}) {
    return (
        <Link
            href={href}
            prefetch
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted"
        >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

export default function PortalDashboard({
    portal,
    stats,
    recentLoans,
    recentApplications,
    currency,
    loanCalculator,
}: Props & {
    loanCalculator: LoanCalculatorConfig;
}) {
    const { auth, tenancy } = usePage().props as {
        auth?: PortalAuth;
        tenancy?: TenancyProps;
    };
    const [copiedCode, copyLenderCode] = useClipboard();
    const customerName = auth?.customer?.name?.split(' ')[0] ?? 'there';
    const organizationName = auth?.organization?.name;
    const lenderCode = auth?.organization?.slug;
    const showLenderCode =
        lenderCode &&
        tenancy?.subdomain_enabled !== true;

    const greeting = getGreeting();

    return (
        <>
            <Head title="Overview" />
            <PortalPage>
                <Card variant="secondary" className="overflow-hidden border-primary/20">
                    <CardContent className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 space-y-2">
                            <p className="text-sm font-medium text-primary">
                                {greeting}, {customerName}
                            </p>
                            <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                                {organizationName
                                    ? `Welcome to ${organizationName}`
                                    : 'Your account overview'}
                            </h1>
                            <p className="max-w-xl text-sm text-muted-foreground">
                                {portal.welcome_message ||
                                    'Track loans, manage applications, and keep your profile up to date.'}
                            </p>
                            {showLenderCode && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <span className="text-sm text-muted-foreground">
                                        Lender code
                                    </span>
                                    <code className="rounded-md border bg-background/80 px-2.5 py-1 font-mono text-sm font-medium">
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
                                    <span className="w-full text-xs text-muted-foreground">
                                        Use this code when signing in on the main
                                        portal URL.
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                asChild
                            >
                                <Link href="/portal/loans">
                                    <Wallet className="mr-2 size-4" />
                                    My loans
                                </Link>
                            </Button>
                            {portal.allow_applications && (
                                <Button
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    asChild
                                >
                                    <Link href="/portal/applications/create/new">
                                        <Plus className="mr-2 size-4" />
                                        Apply for a loan
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <LoanCalculatorWidget
                    config={loanCalculator}
                    description="See how much you might repay before applying for a loan."
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Active loans"
                        value={String(stats.active_loans)}
                        description="Currently running"
                        icon={Wallet}
                        href="/portal/loans"
                    />
                    <StatCard
                        title="Outstanding balance"
                        value={formatMoney(stats.outstanding, currency)}
                        description="Across active loans"
                        icon={TrendingUp}
                        href="/portal/loans"
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="In review"
                        value={String(stats.pending_applications)}
                        description="Submitted applications"
                        icon={ClipboardList}
                        href="/portal/applications"
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Draft applications"
                        value={String(stats.draft_applications)}
                        description="Ready to submit"
                        icon={FileText}
                        href="/portal/applications"
                        accentClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <QuickLinkCard
                        title="View all loans"
                        description="Schedules, repayments, and statements"
                        href="/portal/loans"
                        icon={Wallet}
                    />
                    <QuickLinkCard
                        title="Applications"
                        description="Track status of your requests"
                        href="/portal/applications"
                        icon={ClipboardList}
                    />
                    <QuickLinkCard
                        title="Update profile"
                        description="Contact and employment details"
                        href="/portal/profile"
                        icon={User}
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="flex min-w-0 items-center gap-2">
                                <Wallet className="size-5 shrink-0 text-primary" />
                                <div>
                                    <CardTitle className="text-base">
                                        Recent loans
                                    </CardTitle>
                                    <CardDescription>
                                        Your latest loan accounts
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/portal/loans">View all</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentLoans.length === 0 ? (
                                <EmptyState
                                    icon={Wallet}
                                    title="No loans yet"
                                    description="When your lender disburses a loan to you, it will show up here."
                                    className="m-4 border-0 bg-transparent"
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead className="hidden sm:table-cell">
                                                Product
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Outstanding
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentLoans.map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell>
                                                    <Link
                                                        href={`/portal/loans/${loan.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {loan.reference_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="hidden text-muted-foreground sm:table-cell">
                                                    {loan.product_name}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums font-medium">
                                                    {formatMoney(
                                                        loan.outstanding_balance,
                                                        currency,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <EntityStatusBadge
                                                        status={loan.status}
                                                        type="loan"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="flex min-w-0 items-center gap-2">
                                <ClipboardList className="size-5 shrink-0 text-primary" />
                                <div>
                                    <CardTitle className="text-base">
                                        Recent applications
                                    </CardTitle>
                                    <CardDescription>
                                        Drafts and submitted requests
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/portal/applications">View all</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentApplications.length === 0 ? (
                                <EmptyState
                                    icon={ClipboardList}
                                    title="No applications yet"
                                    description={
                                        portal.allow_applications
                                            ? 'Start a loan application when you are ready to borrow.'
                                            : 'Online applications are not enabled for your account.'
                                    }
                                    className="m-4 border-0 bg-transparent"
                                    action={
                                        portal.allow_applications ? (
                                            <Button asChild size="sm">
                                                <Link href="/portal/applications/create/new">
                                                    <Plus className="mr-2 size-4" />
                                                    New application
                                                </Link>
                                            </Button>
                                        ) : undefined
                                    }
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead className="hidden sm:table-cell">
                                                Product
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Amount
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentApplications.map((application) => (
                                            <TableRow key={application.id}>
                                                <TableCell>
                                                    <Link
                                                        href={`/portal/applications/${application.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {
                                                            application.reference_number
                                                        }
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground sm:hidden">
                                                        {application.product_name}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden text-muted-foreground sm:table-cell">
                                                    {application.product_name}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums font-medium">
                                                    {formatMoney(
                                                        application.requested_amount,
                                                        currency,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <EntityStatusBadge
                                                        status={application.status}
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

                {stats.draft_applications > 0 && (
                    <Card
                        className={cn(
                            'border-amber-500/30 bg-amber-500/5',
                        )}
                    >
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-medium">
                                    You have {stats.draft_applications} draft
                                    application
                                    {stats.draft_applications === 1 ? '' : 's'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Submit when you are ready for your lender to
                                    review.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/portal/applications">
                                    Review drafts
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </PortalPage>
        </>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    if (hour < 17) {
        return 'Good afternoon';
    }

    return 'Good evening';
}

PortalDashboard.layout = {
    breadcrumbs: [{ title: 'Overview', href: '/portal' }],
};

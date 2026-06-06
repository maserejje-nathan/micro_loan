import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CreditCard,
    FileText,
    Package,
    TrendingUp,
    Users,
} from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
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
import { formatMoney } from '@/lib/format-money';
import { dashboard } from '@/routes/admin';
import { index as invoicesIndex } from '@/routes/admin/invoices';
import {
    index as organizationsIndex,
    show as organizationShow,
} from '@/routes/admin/organizations';
import { index as plansIndex } from '@/routes/admin/plans';
import { index as subscriptionsIndex } from '@/routes/admin/subscriptions';

type Stats = {
    organizations: number;
    users: number;
    active_subscriptions: number;
    open_invoices: number;
    mrr: number;
    plans: number;
};

type OrgRow = {
    id: number;
    name: string;
    slug: string;
    users_count: number;
    created_at: string;
};

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function AdminDashboard({
    stats,
    recentOrganizations,
    loanCalculator,
}: {
    stats: Stats;
    recentOrganizations: OrgRow[];
    loanCalculator: LoanCalculatorConfig;
}) {
    return (
        <>
            <Head title="Admin dashboard" />
            <div className="flex w-full flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Platform overview
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        System-wide metrics and recent tenant activity
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                        title="Organizations"
                        value={String(stats.organizations)}
                        description="Registered tenants"
                        icon={Building2}
                        href={organizationsIndex().url}
                    />
                    <StatCard
                        title="Platform users"
                        value={String(stats.users)}
                        description="Excluding super admins"
                        icon={Users}
                    />
                    <StatCard
                        title="Active subscriptions"
                        value={String(stats.active_subscriptions)}
                        description="Active or trialing"
                        icon={CreditCard}
                        href={subscriptionsIndex().url}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        title="Open invoices"
                        value={String(stats.open_invoices)}
                        description="Open or overdue"
                        icon={FileText}
                        href={invoicesIndex().url}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Est. MRR"
                        value={formatMoney(stats.mrr, 'UGX')}
                        description="From active monthly plans"
                        icon={TrendingUp}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="Active plans"
                        value={String(stats.plans)}
                        description="Published subscription tiers"
                        icon={Package}
                        href={plansIndex().url}
                    />
                </div>

                <LoanCalculatorWidget
                    config={loanCalculator}
                    description="Demo calculator using default assumptions — tenant products appear on each organization's dashboard."
                />

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle>Recent organizations</CardTitle>
                                <CardDescription>
                                    Latest tenants on the platform
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={organizationsIndex().url}>
                                    View all
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentOrganizations.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Building2}
                                    title="No organizations yet"
                                    description="Tenants appear when users complete onboarding."
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Organization</TableHead>
                                        <TableHead className="hidden sm:table-cell">
                                            Slug
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Users
                                        </TableHead>
                                        <TableHead className="hidden text-right md:table-cell">
                                            Created
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrganizations.map((org) => (
                                        <TableRow key={org.id}>
                                            <TableCell className="font-medium">
                                                {org.name}
                                            </TableCell>
                                            <TableCell className="hidden font-mono text-sm text-muted-foreground sm:table-cell">
                                                {org.slug}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {org.users_count}
                                            </TableCell>
                                            <TableCell className="hidden text-right text-sm text-muted-foreground md:table-cell">
                                                {formatDateTime(org.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={organizationShow.url(
                                                            org.id,
                                                        )}
                                                    >
                                                        Manage
                                                    </Link>
                                                </Button>
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

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard().url }],
};

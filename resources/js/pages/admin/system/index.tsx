import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    Database,
    FileDiff,
    HardDrive,
    ScrollText,
    Server,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { HealthStatCard } from '@/components/admin/health-stat-card';
import { AuditCategoryBadge } from '@/components/audit-logs/audit-category-badge';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { StatCard } from '@/components/stat-card';
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
import { auditCategoryLabel } from '@/lib/audit-log';
import { index as organizationsIndex } from '@/routes/admin/organizations';
import { index as systemIndex } from '@/routes/admin/system';
import type { Paginated } from '@/types/pagination';

type Health = {
    database: boolean;
    queue: string;
    cache: string;
    app_env: string;
    app_debug: boolean;
    php_version: string;
    laravel_version: string;
};

type AuditLogRow = {
    id: number;
    action: string;
    action_label: string;
    category: string;
    user_name: string;
    entity_label: string | null;
    entity_url: string | null;
    organization_id: number | null;
    organization_name: string | null;
    summary: string | null;
    created_at: string;
};

const CATEGORY_KEYS = [
    'customer',
    'loan_application',
    'loan',
    'loan_product',
    'repayment',
    'team',
] as const;

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AdminSystemIndex({
    health,
    recentAuditLogs,
    auditStats,
    categoryCounts,
    platformStats,
    commands,
}: {
    health: Health;
    recentAuditLogs: Paginated<AuditLogRow>;
    auditStats: {
        total: number;
        today: number;
        this_week: number;
        with_changes: number;
    };
    categoryCounts: Record<string, number>;
    platformStats: { organizations: number; audit_logs: number };
    commands: { key: string; label: string }[];
}) {
    return (
        <>
            <Head title="System" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            System health
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Runtime diagnostics, platform scale, and cross-tenant
                            audit activity
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <code className="rounded-md border bg-muted px-2 py-1 text-xs">
                            PHP {health.php_version}
                        </code>
                        <code className="rounded-md border bg-muted px-2 py-1 text-xs">
                            Laravel {health.laravel_version}
                        </code>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <HealthStatCard
                        label="Database"
                        value={health.database ? 'Connected' : 'Unavailable'}
                        ok={health.database}
                        icon={Database}
                    />
                    <HealthStatCard
                        label="Queue"
                        value={health.queue}
                        icon={Server}
                        description="Background job transport"
                    />
                    <HealthStatCard
                        label="Cache"
                        value={health.cache}
                        icon={HardDrive}
                    />
                    <HealthStatCard
                        label="Environment"
                        value={health.app_env}
                        icon={ShieldCheck}
                        description={
                            health.app_debug
                                ? 'Debug mode enabled'
                                : 'Production-safe'
                        }
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Organizations"
                        value={String(platformStats.organizations)}
                        icon={Building2}
                        href={organizationsIndex().url}
                    />
                    <StatCard
                        title="Audit events"
                        value={String(auditStats.total)}
                        description="All tenants, all time"
                        icon={ScrollText}
                    />
                    <StatCard
                        title="Today"
                        value={String(auditStats.today)}
                        icon={CalendarDays}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="With field changes"
                        value={String(auditStats.with_changes)}
                        description={`${auditStats.this_week} this week`}
                        icon={FileDiff}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">
                            Debug &amp; security
                        </CardTitle>
                        <CardDescription>
                            Configuration flags affecting production safety
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                        <HealthStatCard
                            label="Debug mode"
                            value={health.app_debug ? 'On' : 'Off'}
                            ok={!health.app_debug}
                            icon={ShieldAlert}
                            description={
                                health.app_debug
                                    ? 'Not recommended in production'
                                    : 'Disabled — expected for production'
                            }
                        />
                        <div className="rounded-lg border border-border bg-muted p-4 text-sm">
                            <p className="font-medium">Platform records</p>
                            <dl className="mt-3 space-y-2 text-muted-foreground">
                                <div className="flex justify-between">
                                    <dt>Audit log rows</dt>
                                    <dd className="font-medium text-foreground tabular-nums">
                                        {platformStats.audit_logs.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Organizations</dt>
                                    <dd className="font-medium text-foreground tabular-nums">
                                        {platformStats.organizations.toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">
                            Audit activity by category
                        </CardTitle>
                        <CardDescription>
                            Cross-tenant event distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-border bg-muted px-3 py-2">
                                <p className="text-xs text-muted-foreground">
                                    All events
                                </p>
                                <p className="text-xl font-semibold tabular-nums">
                                    {categoryCounts.all ?? 0}
                                </p>
                            </div>
                            {CATEGORY_KEYS.map((key) => (
                                <div
                                    key={key}
                                    className="rounded-lg border border-border bg-muted px-3 py-2"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {auditCategoryLabel(key)}
                                    </p>
                                    <p className="text-xl font-semibold tabular-nums">
                                        {categoryCounts[key] ?? 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {commands.length > 0 && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Scheduled commands
                            </CardTitle>
                            <CardDescription>
                                Run via server cron or queue worker
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-2 text-sm">
                                {commands.map((command) => (
                                    <li
                                        key={command.key}
                                        className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2"
                                    >
                                        <span>{command.label}</span>
                                        <code className="text-xs text-muted-foreground">
                                            {command.key}
                                        </code>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Recent audit logs</CardTitle>
                        <CardDescription>
                            Cross-tenant activity (latest 20)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentAuditLogs.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={ScrollText}
                                    title="No audit events"
                                    description="Tenant activity will appear here as users work in the app."
                                />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Category
                                            </TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Entity
                                            </TableHead>
                                            <TableHead>Tenant</TableHead>
                                            <TableHead className="text-right">
                                                When
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentAuditLogs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <p className="text-sm font-medium">
                                                        {log.action_label}
                                                    </p>
                                                    {log.summary && (
                                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                                            {log.summary}
                                                        </p>
                                                    )}
                                                    <p className="font-mono text-xs text-muted-foreground md:hidden">
                                                        {log.action}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <AuditCategoryBadge
                                                        category={log.category}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {log.user_name}
                                                </TableCell>
                                                <TableCell className="hidden text-sm lg:table-cell">
                                                    {log.entity_label ? (
                                                        log.entity_url ? (
                                                            <Link
                                                                href={
                                                                    log.entity_url
                                                                }
                                                                className="hover:underline"
                                                            >
                                                                {
                                                                    log.entity_label
                                                                }
                                                            </Link>
                                                        ) : (
                                                            log.entity_label
                                                        )
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {log.organization_name ? (
                                                        <span>
                                                            {
                                                                log.organization_name
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Platform
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        log.created_at,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <DataTablePagination paginator={recentAuditLogs} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminSystemIndex.layout = {
    breadcrumbs: [{ title: 'System', href: systemIndex().url }],
};

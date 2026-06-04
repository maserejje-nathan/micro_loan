import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronDown,
    FileDiff,
    ScrollText,
    Shield,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { AuditCategoryBadge } from '@/components/audit-logs/audit-category-badge';
import { AuditLogChanges } from '@/components/audit-logs/audit-log-changes';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
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
import { auditCategoryLabel } from '@/lib/audit-log';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';
import { index as auditLogsIndex } from '@/routes/audit-logs';

type AuditLogEntry = {
    id: number;
    action: string;
    action_label: string;
    category: string;
    user_id: number | null;
    user_name: string;
    entity_type: string | null;
    entity_id: number | null;
    entity_label: string | null;
    entity_url: string | null;
    summary: string | null;
    has_changes: boolean;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
};

const FILTER_CATEGORIES = [
    { key: null, label: 'All' },
    { key: 'customer', label: 'Customers' },
    { key: 'loan_application', label: 'Applications' },
    { key: 'loan', label: 'Loans' },
    { key: 'loan_product', label: 'Products' },
    { key: 'repayment', label: 'Repayments' },
    { key: 'team', label: 'Team' },
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

function AuditLogRow({ log }: { log: AuditLogEntry }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow
                className={cn(
                    log.has_changes && 'cursor-pointer hover:bg-muted',
                    open && 'bg-muted',
                )}
                onClick={() => {
                    if (log.has_changes) {
                        setOpen((value) => !value);
                    }
                }}
            >
                <TableCell className="align-top">
                    {log.has_changes ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="size-8 shrink-0"
                            aria-label={open ? 'Hide changes' : 'Show changes'}
                            onClick={(event) => {
                                event.stopPropagation();
                                setOpen((value) => !value);
                            }}
                        >
                            <ChevronDown
                                className={cn(
                                    'size-4 transition-transform',
                                    open && 'rotate-180',
                                )}
                            />
                        </Button>
                    ) : (
                        <span className="inline-block size-8" />
                    )}
                </TableCell>
                    <TableCell className="align-top">
                        <p className="font-medium">{log.action_label}</p>
                        {log.summary && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {log.summary}
                            </p>
                        )}
                    </TableCell>
                    <TableCell className="hidden align-top md:table-cell">
                        <AuditCategoryBadge category={log.category} />
                    </TableCell>
                    <TableCell className="align-top">
                        <p>{log.user_name}</p>
                        {log.ip_address && (
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                {log.ip_address}
                            </p>
                        )}
                    </TableCell>
                    <TableCell className="hidden align-top lg:table-cell">
                        {log.entity_label ? (
                            log.entity_url ? (
                                <Link
                                    href={log.entity_url}
                                    className="text-sm hover:underline"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    {log.entity_label}
                                </Link>
                            ) : (
                                <span className="text-sm">{log.entity_label}</span>
                            )
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                —
                            </span>
                        )}
                        {log.entity_type && (
                            <p className="text-xs text-muted-foreground">
                                {log.entity_type}
                            </p>
                        )}
                    </TableCell>
                    <TableCell className="align-top text-sm text-muted-foreground">
                        <span className="lg:hidden">
                            <AuditCategoryBadge
                                category={log.category}
                                className="mb-1"
                            />
                        </span>
                        {formatDateTime(log.created_at)}
                    </TableCell>
            </TableRow>
            {open && log.has_changes && (
                <TableRow className="bg-muted hover:bg-muted">
                    <TableCell colSpan={6} className="p-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Field changes
                        </p>
                        <AuditLogChanges
                            oldValues={log.old_values}
                            newValues={log.new_values}
                        />
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

export default function AuditLogsIndex({
    logs,
    stats,
    activeCategory,
    categoryCounts,
}: {
    logs: Paginated<AuditLogEntry>;
    stats: {
        total: number;
        today: number;
        this_week: number;
        with_changes: number;
    };
    activeCategory: string | null;
    categoryCounts: Record<string, number>;
}) {
    const total = paginatorTotal(logs);

    return (
        <>
            <Head title="Audit logs" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Audit logs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Immutable activity trail for compliance and accountability
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total events"
                        value={String(stats.total)}
                        description="All recorded activity"
                        icon={ScrollText}
                    />
                    <StatCard
                        title="Today"
                        value={String(stats.today)}
                        description="Events since midnight"
                        icon={CalendarDays}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="This week"
                        value={String(stats.this_week)}
                        description="Last seven days"
                        icon={Shield}
                    />
                    <StatCard
                        title="With field changes"
                        value={String(stats.with_changes)}
                        description="Entries storing before/after data"
                        icon={FileDiff}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {FILTER_CATEGORIES.map((filter) => {
                        const countKey = filter.key ?? 'all';
                        const count = categoryCounts[countKey] ?? 0;
                        const isActive =
                            (filter.key === null && !activeCategory) ||
                            filter.key === activeCategory;

                        return (
                            <Button
                                key={countKey}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link
                                    href={
                                        filter.key
                                            ? auditLogsIndex.url({
                                                  query: {
                                                      category: filter.key,
                                                  },
                                              })
                                            : auditLogsIndex.url()
                                    }
                                    preserveScroll
                                >
                                    {filter.label}
                                    <span
                                        className={cn(
                                            'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                                            isActive
                                                ? 'bg-primary-foreground/20'
                                                : 'bg-muted',
                                        )}
                                    >
                                        {count}
                                    </span>
                                </Link>
                            </Button>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Activity log</CardTitle>
                        <CardDescription>
                            {activeCategory
                                ? `${auditCategoryLabel(activeCategory)} only · `
                                : ''}
                            {total} {total === 1 ? 'event' : 'events'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {logs.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Users}
                                    title={
                                        activeCategory
                                            ? 'No events in this category'
                                            : 'No audit events yet'
                                    }
                                    description={
                                        activeCategory
                                            ? 'Try another filter or perform an action that generates logs.'
                                            : 'Activity appears when customers, loans, repayments, or team settings change.'
                                    }
                                    action={
                                        activeCategory ? (
                                            <Button variant="outline" asChild>
                                                <Link href={auditLogsIndex.url()}>
                                                    Show all events
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
                                        <TableHead className="w-10" />
                                        <TableHead>Action</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Category
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="hidden lg:table-cell">
                                            Entity
                                        </TableHead>
                                        <TableHead>When</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.map((log) => (
                                        <AuditLogRow key={log.id} log={log} />
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={logs} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AuditLogsIndex.layout = {
    breadcrumbs: [{ title: 'Audit logs', href: auditLogsIndex().url }],
};

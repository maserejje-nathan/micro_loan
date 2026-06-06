import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileText,
    Plus,
    XCircle,
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
import { index as applicationsIndex } from '@/routes/portal/applications';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type ApplicationRow = {
    id: number;
    reference_number: string;
    product_name: string;
    product_code: string;
    requested_amount: number;
    approved_amount: number | null;
    term_days: number;
    status: string;
    created_at: string;
};

type Filter = 'all' | 'draft' | 'pending' | 'approved' | 'rejected';

function filterUrl(filter: Filter): string {
    if (filter === 'all') {
        return applicationsIndex.url();
    }

    return applicationsIndex.url({ query: { filter } });
}

function formatDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function PortalApplicationsIndex({
    applications,
    filter,
    currency,
    canApply,
    stats,
}: {
    applications: Paginated<ApplicationRow>;
    filter: Filter;
    currency: string;
    canApply: boolean;
    stats: {
        total: number;
        draft: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}) {

    const filters: { key: Filter; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: stats.total },
        { key: 'draft', label: 'Drafts', count: stats.draft },
        { key: 'pending', label: 'In review', count: stats.pending },
        { key: 'approved', label: 'Approved', count: stats.approved },
        { key: 'rejected', label: 'Rejected', count: stats.rejected },
    ];

    return (
        <>
            <Head title="Applications" />
            <PortalPage>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            Applications
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create, submit, and track your loan requests.
                        </p>
                    </div>
                    {canApply && (
                        <Button className="w-full shrink-0 sm:w-auto" asChild>
                            <Link href="/portal/applications/create/new">
                                <Plus className="mr-2 size-4" />
                                New application
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total"
                        value={String(stats.total)}
                        description="All applications"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Drafts"
                        value={String(stats.draft)}
                        description="Not yet submitted"
                        icon={FileText}
                        accentClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    />
                    <StatCard
                        title="In review"
                        value={String(stats.pending)}
                        description="Awaiting lender decision"
                        icon={Clock}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Approved"
                        value={String(stats.approved)}
                        description="Accepted applications"
                        icon={CheckCircle2}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                {stats.draft > 0 && (
                    <Card variant="warning">
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm">
                                <span className="font-medium">
                                    {stats.draft} draft
                                    {stats.draft === 1 ? '' : 's'}
                                </span>{' '}
                                ready to submit for lender review.
                            </p>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/portal/applications">
                                    Review drafts
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="size-5 text-primary" />
                            <div>
                                <CardTitle className="text-base">
                                    Your applications
                                </CardTitle>
                                <CardDescription>
                                    {paginatorTotal(applications)} of {stats.total}{' '}
                                    shown
                                </CardDescription>
                            </div>
                        </div>
                        <div className="w-full overflow-x-auto overscroll-x-contain">
                            <div className="flex w-max min-w-full gap-1 rounded-lg border border-border bg-muted p-1 sm:w-full sm:flex-wrap">
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
                        {applications.data.length === 0 ? (
                            <EmptyState
                                icon={ClipboardList}
                                title={
                                    filter === 'all'
                                        ? 'No applications yet'
                                        : `No ${filters.find((f) => f.key === filter)?.label.toLowerCase()} applications`
                                }
                                description={
                                    filter === 'all' && canApply
                                        ? 'Start a new application when you are ready to borrow.'
                                        : 'Try another filter or create a new application.'
                                }
                                className="m-4 border-0 bg-transparent py-12"
                                action={
                                    filter === 'all' && canApply ? (
                                        <Button asChild>
                                            <Link href="/portal/applications/create/new">
                                                <Plus className="mr-2 size-4" />
                                                New application
                                            </Link>
                                        </Button>
                                    ) : filter !== 'all' ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={filterUrl('all')}>
                                                Show all
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <div className="grid gap-4 p-4 lg:hidden">
                                    {applications.data.map((application) => (
                                        <Link
                                            key={application.id}
                                            href={`/portal/applications/${application.id}`}
                                            className="block rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">
                                                        {
                                                            application.reference_number
                                                        }
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {application.product_name}
                                                    </p>
                                                </div>
                                                <EntityStatusBadge
                                                    status={application.status}
                                                    type="loan_application"
                                                />
                                            </div>
                                            <div className="mt-3 flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {formatDate(
                                                        application.created_at,
                                                    )}
                                                </span>
                                                <span className="font-medium tabular-nums">
                                                    {formatMoney(
                                                        application.requested_amount,
                                                        currency,
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <div className="hidden lg:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">
                                                    Term
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Amount
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-10" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.data.map(
                                                (application) => (
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-muted-foreground">
                                                                {
                                                                    application.product_name
                                                                }
                                                            </span>
                                                            <span className="ml-1 font-mono text-xs">
                                                                (
                                                                {
                                                                    application.product_code
                                                                }
                                                                )
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {formatDate(
                                                                application.created_at,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {application.term_days}{' '}
                                                            days
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums font-medium">
                                                            {formatMoney(
                                                                application.requested_amount,
                                                                currency,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <EntityStatusBadge
                                                                status={
                                                                    application.status
                                                                }
                                                                type="loan_application"
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
                                                                    href={`/portal/applications/${application.id}`}
                                                                >
                                                                    <ArrowRight className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                        <DataTablePagination paginator={applications} />
                    </CardContent>
                </Card>

                {stats.rejected > 0 && filter === 'all' && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="size-4 text-destructive" />
                        {stats.rejected} rejected application
                        {stats.rejected === 1 ? '' : 's'} — open one to see the
                        reason.
                    </p>
                )}
            </PortalPage>
        </>
    );
}

PortalApplicationsIndex.layout = {
    breadcrumbs: [
        { title: 'Overview', href: '/portal' },
        { title: 'Applications', href: '/portal/applications' },
    ],
};

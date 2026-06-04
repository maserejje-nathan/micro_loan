import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    Clock,
    Search,
    UserX,
    Users,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { BillingStatusBadge } from '@/components/admin/billing-status-badge';
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
import { Input } from '@/components/ui/input';
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
import {
    index as organizationsIndex,
    show as organizationShow,
} from '@/routes/admin/organizations';
import { index as subscriptionsIndex } from '@/routes/admin/subscriptions';

type Org = {
    id: number;
    name: string;
    slug: string;
    subdomain: string | null;
    currency: string;
    users_count: number;
    customers_count: number;
    subscription_status: string | null;
    plan_name: string | null;
    plan_price: number | null;
    created_at: string;
};

const BILLING_FILTERS = [
    { key: null, label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'trialing', label: 'Trialing' },
    { key: 'past_due', label: 'Past due' },
    { key: 'none', label: 'No billing' },
] as const;

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function filterUrl(billing: string | null, search: string | null): string {
    const query: Record<string, string> = {};

    if (billing) {
        query.billing = billing;
    }

    if (search) {
        query.search = search;
    }

    return Object.keys(query).length > 0
        ? organizationsIndex.url({ query })
        : organizationsIndex.url();
}

export default function AdminOrganizationsIndex({
    organizations,
    stats,
    filters,
}: {
    organizations: Paginated<Org>;
    stats: {
        total: number;
        with_active_subscription: number;
        trialing: number;
        past_due: number;
        without_billing: number;
    };
    filters: { billing: string | null; search: string | null };
}) {
    const total = paginatorTotal(organizations);
    const [search, setSearch] = useState(filters.search ?? '');
    const hasFilters = Boolean(filters.billing || filters.search);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            filterUrl(filters.billing, search.trim() || null),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        router.get(organizationsIndex.url());
    };

    return (
        <>
            <Head title="Organizations" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Organizations
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tenants, workspace URLs, and billing status
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={subscriptionsIndex().url}>
                            View subscriptions
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total tenants"
                        value={String(stats.total)}
                        description="Registered organizations"
                        icon={Building2}
                    />
                    <StatCard
                        title="Active billing"
                        value={String(stats.with_active_subscription)}
                        description="Active or trialing"
                        icon={CheckCircle2}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        href={filterUrl('active', filters.search)}
                    />
                    <StatCard
                        title="On trial"
                        value={String(stats.trialing)}
                        icon={Clock}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        href={filterUrl('trialing', filters.search)}
                    />
                    <StatCard
                        title="Past due"
                        value={String(stats.past_due)}
                        description={`${stats.without_billing} without billing`}
                        icon={AlertTriangle}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        href={filterUrl('past_due', filters.search)}
                    />
                </div>

                <Card>
                    <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>All tenants</CardTitle>
                            <CardDescription>
                                {total}{' '}
                                {total === 1 ? 'organization' : 'organizations'}
                                {hasFilters ? ' matching filters' : ''}
                            </CardDescription>
                        </div>
                        <form
                            onSubmit={submitSearch}
                            className="flex w-full max-w-sm gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search name or slug…"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    className="pl-8"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0">
                        <div className="flex flex-wrap items-center gap-2 pt-4">
                            {BILLING_FILTERS.map((filter) => {
                                const isActive =
                                    (filter.key === null && !filters.billing) ||
                                    filter.key === filters.billing;
                                const count =
                                    filter.key === null
                                        ? stats.total
                                        : filter.key === 'active'
                                          ? stats.with_active_subscription
                                          : filter.key === 'trialing'
                                            ? stats.trialing
                                            : filter.key === 'past_due'
                                              ? stats.past_due
                                              : stats.without_billing;

                                return (
                                    <Button
                                        key={filter.key ?? 'all'}
                                        variant={
                                            isActive ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                    >
                                        <Link
                                            href={filterUrl(
                                                filter.key,
                                                filters.search,
                                            )}
                                            preserveScroll
                                        >
                                            {filter.label}
                                            <span
                                                className={cn(
                                                    'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                                                    isActive
                                                        ? 'bg-primary-foreground/20'
                                                        : 'bg-muted text-muted-foreground',
                                                )}
                                            >
                                                {count}
                                            </span>
                                        </Link>
                                    </Button>
                                );
                            })}
                            {hasFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>

                        {organizations.data.length === 0 ? (
                            <EmptyState
                                icon={Building2}
                                title={
                                    hasFilters
                                        ? 'No matching organizations'
                                        : 'No organizations'
                                }
                                description={
                                    hasFilters
                                        ? 'Try a different filter or search term.'
                                        : 'Organizations are created when users onboard.'
                                }
                                action={
                                    hasFilters ? (
                                        <Button
                                            variant="outline"
                                            onClick={clearFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <div className="-mx-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Organization</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Workspace
                                            </TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden sm:table-cell text-right">
                                                Team
                                            </TableHead>
                                            <TableHead className="hidden lg:table-cell text-right">
                                                Customers
                                            </TableHead>
                                            <TableHead className="hidden xl:table-cell text-right">
                                                Created
                                            </TableHead>
                                            <TableHead className="w-12 text-right">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {organizations.data.map((org) => (
                                            <TableRow key={org.id}>
                                                <TableCell>
                                                    <Link
                                                        href={organizationShow.url(
                                                            org.id,
                                                        )}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {org.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {org.currency}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                                    <p className="font-mono text-xs">
                                                        {org.slug}
                                                    </p>
                                                    {org.subdomain && (
                                                        <p>{org.subdomain}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {org.plan_name ? (
                                                        <>
                                                            <p className="font-medium">
                                                                {org.plan_name}
                                                            </p>
                                                            {org.plan_price !==
                                                                null && (
                                                                <p className="text-xs text-muted-foreground tabular-nums">
                                                                    {formatMoney(
                                                                        org.plan_price,
                                                                        org.currency,
                                                                    )}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {org.subscription_status ? (
                                                        <BillingStatusBadge
                                                            status={
                                                                org.subscription_status
                                                            }
                                                            type="subscription"
                                                        />
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                            <UserX className="size-3.5" />
                                                            No plan
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden text-right sm:table-cell">
                                                    <span className="inline-flex items-center justify-end gap-1 text-sm tabular-nums">
                                                        <Users className="size-3.5 text-muted-foreground" />
                                                        {org.users_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden text-right text-sm tabular-nums lg:table-cell">
                                                    {org.customers_count}
                                                </TableCell>
                                                <TableCell className="hidden text-right text-sm text-muted-foreground xl:table-cell">
                                                    {formatDateTime(
                                                        org.created_at,
                                                    )}
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
                            </div>
                        )}
                        <DataTablePagination paginator={organizations} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminOrganizationsIndex.layout = {
    breadcrumbs: [
        { title: 'Organizations', href: organizationsIndex().url },
    ],
};

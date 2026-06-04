import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Clock,
    CreditCard,
    Search,
    TrendingUp,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { BillingStatusBadge } from '@/components/admin/billing-status-badge';
import { SubscriptionPeriod } from '@/components/admin/subscription-period';
import { SubscriptionRowActions } from '@/components/admin/subscription-row-actions';
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
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';
import { index as organizationsIndex } from '@/routes/admin/organizations';
import { index as plansIndex } from '@/routes/admin/plans';
import { index as subscriptionsIndex } from '@/routes/admin/subscriptions';
import { show as organizationShow } from '@/routes/admin/organizations';

type Sub = {
    id: number;
    status: string;
    organization: { id: number; name: string; slug: string };
    plan: {
        id: number;
        name: string;
        price: number;
        currency: string;
        billing_interval: string;
    };
    trial_ends_at: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    canceled_at: string | null;
    created_at: string;
};

const STATUS_FILTERS = [
    { key: null, label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'trialing', label: 'Trialing' },
    { key: 'past_due', label: 'Past due' },
    { key: 'paused', label: 'Paused' },
    { key: 'canceled', label: 'Canceled' },
] as const;

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function filterUrl(status: string | null, search: string | null): string {
    const query: Record<string, string> = {};

    if (status) {
        query.status = status;
    }

    if (search) {
        query.search = search;
    }

    return Object.keys(query).length > 0
        ? subscriptionsIndex.url({ query })
        : subscriptionsIndex.url();
}

export default function AdminSubscriptionsIndex({
    subscriptions,
    stats,
    filters,
    statuses,
}: {
    subscriptions: Paginated<Sub>;
    stats: {
        total: number;
        active: number;
        trialing: number;
        past_due: number;
        paused: number;
        canceled: number;
        mrr: number;
    };
    filters: { status: string | null; search: string | null };
    statuses: string[];
}) {
    const total = paginatorTotal(subscriptions);
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            filterUrl(filters.status, search.trim() || null),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        router.get(subscriptionsIndex.url());
    };

    const hasFilters = Boolean(filters.status || filters.search);

    return (
        <>
            <Head title="Subscriptions" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Subscriptions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tenant billing relationships, MRR, and lifecycle
                            actions
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={organizationsIndex().url}>
                            <Building2 className="mr-2 size-4" />
                            Organizations
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Monthly recurring"
                        value={formatMoney(stats.mrr, 'UGX')}
                        description={`${stats.active} active subscriptions`}
                        icon={TrendingUp}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        href={filterUrl('active', filters.search)}
                    />
                    <StatCard
                        title="On trial"
                        value={String(stats.trialing)}
                        description="Trialing tenants"
                        icon={Clock}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        href={filterUrl('trialing', filters.search)}
                    />
                    <StatCard
                        title="Past due"
                        value={String(stats.past_due)}
                        description="Needs attention"
                        icon={AlertTriangle}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        href={filterUrl('past_due', filters.search)}
                    />
                    <StatCard
                        title="Total records"
                        value={String(stats.total)}
                        description={`${stats.canceled} canceled · ${stats.paused} paused`}
                        icon={CreditCard}
                    />
                </div>

                <Card>
                    <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>All subscriptions</CardTitle>
                            <CardDescription>
                                {total}{' '}
                                {total === 1 ? 'subscription' : 'subscriptions'}
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
                                    placeholder="Search org or plan…"
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
                            {STATUS_FILTERS.map((filter) => {
                                const isActive =
                                    (filter.key === null && !filters.status) ||
                                    filter.key === filters.status;
                                const count =
                                    filter.key === null
                                        ? stats.total
                                        : filter.key === 'active'
                                          ? stats.active
                                          : filter.key === 'trialing'
                                            ? stats.trialing
                                            : filter.key === 'past_due'
                                              ? stats.past_due
                                              : filter.key === 'paused'
                                                ? stats.paused
                                                : stats.canceled;

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

                        {subscriptions.data.length === 0 ? (
                            <EmptyState
                                icon={CreditCard}
                                title={
                                    hasFilters
                                        ? 'No matching subscriptions'
                                        : 'No subscriptions'
                                }
                                description={
                                    hasFilters
                                        ? 'Try a different status or search term.'
                                        : 'Assign plans from an organization page.'
                                }
                                action={
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {hasFilters && (
                                            <Button
                                                variant="outline"
                                                onClick={clearFilters}
                                            >
                                                Clear filters
                                            </Button>
                                        )}
                                        <Button variant="outline" asChild>
                                            <Link
                                                href={organizationsIndex().url}
                                            >
                                                View organizations
                                            </Link>
                                        </Button>
                                    </div>
                                }
                            />
                        ) : (
                            <div className="-mx-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Organization</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Billing
                                            </TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Period
                                            </TableHead>
                                            <TableHead className="hidden xl:table-cell">
                                                Started
                                            </TableHead>
                                            <TableHead className="w-12 text-right">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscriptions.data.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell>
                                                    <Link
                                                        href={organizationShow.url(
                                                            sub.organization.id,
                                                        )}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {
                                                            sub.organization
                                                                .name
                                                        }
                                                    </Link>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {sub.organization.slug}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={plansIndex().url}
                                                        className="text-sm font-medium hover:underline"
                                                    >
                                                        {sub.plan.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <BillingStatusBadge
                                                        status={sub.status}
                                                        type="subscription"
                                                    />
                                                </TableCell>
                                                <TableCell className="hidden text-sm md:table-cell">
                                                    <p className="font-medium tabular-nums">
                                                        {formatMoney(
                                                            sub.plan.price,
                                                            sub.plan.currency,
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground capitalize">
                                                        {formatEnumLabel(
                                                            sub.plan
                                                                .billing_interval,
                                                        )}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <SubscriptionPeriod
                                                        status={sub.status}
                                                        trialEndsAt={
                                                            sub.trial_ends_at
                                                        }
                                                        currentPeriodEnd={
                                                            sub.current_period_end
                                                        }
                                                        canceledAt={
                                                            sub.canceled_at
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                                                    {formatDateTime(
                                                        sub.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <SubscriptionRowActions
                                                        id={sub.id}
                                                        status={sub.status}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <DataTablePagination paginator={subscriptions} />
                    </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground">
                    Available statuses:{' '}
                    {statuses.map((s) => formatEnumLabel(s)).join(', ')}.
                    Renewing a period generates a subscription invoice.
                </p>
            </div>
        </>
    );
}

AdminSubscriptionsIndex.layout = {
    breadcrumbs: [{ title: 'Subscriptions', href: subscriptionsIndex().url }],
};

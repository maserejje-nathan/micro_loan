import { Head, Link, router } from '@inertiajs/react';
import { Package, Plus, Search, TrendingUp, Users } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import { PlanRowActions } from '@/components/admin/plan-row-actions';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
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
import { formatPlanLimits } from '@/lib/plan-limits';
import { cn } from '@/lib/utils';
import { create, index as plansIndex } from '@/routes/admin/plans';
import { index as subscriptionsIndex } from '@/routes/admin/subscriptions';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    currency: string;
    billing_interval: string;
    trial_days: number;
    max_users: number | null;
    max_customers: number | null;
    max_active_loans: number | null;
    is_active: boolean;
    subscriptions_count: number;
    active_subscriptions_count: number;
};

const ACTIVE_FILTERS = [
    { key: null, label: 'All' },
    { key: '1', label: 'Active' },
    { key: '0', label: 'Inactive' },
] as const;

function filterUrl(active: string | null, search: string | null): string {
    const query: Record<string, string> = {};

    if (active !== null) {
        query.active = active;
    }

    if (search) {
        query.search = search;
    }

    return Object.keys(query).length > 0
        ? plansIndex.url({ query })
        : plansIndex.url();
}

export default function AdminPlansIndex({
    plans,
    stats,
    filters,
}: {
    plans: Paginated<Plan>;
    stats: {
        total: number;
        active: number;
        inactive: number;
        subscriptions: number;
        mrr: number;
    };
    filters: { active: string | null; search: string | null };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const hasFilters = Boolean(filters.active !== null || filters.search);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            filterUrl(filters.active, search.trim() || null),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        router.get(plansIndex.url());
    };

    return (
        <>
            <Head title="Subscription plans" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Subscription plans
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pricing tiers, limits, and tenant assignments
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url}>
                            <Plus className="mr-2 size-4" />
                            New plan
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Monthly recurring"
                        value={formatMoney(stats.mrr, 'UGX')}
                        description="From active subscriptions"
                        icon={TrendingUp}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        href={subscriptionsIndex().url}
                    />
                    <StatCard
                        title="Active plans"
                        value={String(stats.active)}
                        description={`${stats.inactive} inactive`}
                        icon={Package}
                        href={filterUrl('1', filters.search)}
                    />
                    <StatCard
                        title="Total plans"
                        value={String(stats.total)}
                        icon={Package}
                    />
                    <StatCard
                        title="Subscriptions"
                        value={String(stats.subscriptions)}
                        description="All-time records"
                        icon={Users}
                        href={subscriptionsIndex().url}
                    />
                </div>

                <Card>
                    <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>All plans</CardTitle>
                            <CardDescription>
                                {paginatorTotal(plans)}{' '}
                                {paginatorTotal(plans) === 1 ? 'plan' : 'plans'}
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
                                    placeholder="Search plans…"
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
                            {ACTIVE_FILTERS.map((filter) => {
                                const isActive =
                                    (filter.key === null &&
                                        filters.active === null) ||
                                    filter.key === filters.active;
                                const count =
                                    filter.key === null
                                        ? stats.total
                                        : filter.key === '1'
                                          ? stats.active
                                          : stats.inactive;

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

                        {plans.data.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title={
                                    hasFilters
                                        ? 'No matching plans'
                                        : 'No plans yet'
                                }
                                description={
                                    hasFilters
                                        ? 'Try a different filter or search term.'
                                        : 'Create a subscription plan to bill organizations.'
                                }
                                action={
                                    <Button asChild>
                                        <Link href={create().url}>
                                            New plan
                                        </Link>
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="-mx-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Plan</TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Limits
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Price
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell text-right">
                                                Trial
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Subs
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-12 text-right">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plans.data.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell>
                                                    <p className="font-medium">
                                                        {plan.name}
                                                    </p>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {plan.slug}
                                                    </p>
                                                    <p className="mt-0.5 text-xs capitalize text-muted-foreground md:hidden">
                                                        {formatEnumLabel(
                                                            plan.billing_interval,
                                                        )}
                                                    </p>
                                                    {plan.description && (
                                                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                            {plan.description}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                                                    {formatPlanLimits(plan)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <p className="font-medium tabular-nums">
                                                        {formatMoney(
                                                            plan.price,
                                                            plan.currency,
                                                        )}
                                                    </p>
                                                    <p className="text-xs capitalize text-muted-foreground">
                                                        {formatEnumLabel(
                                                            plan.billing_interval,
                                                        )}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden text-right text-sm text-muted-foreground md:table-cell">
                                                    {plan.trial_days} days
                                                </TableCell>
                                                <TableCell className="text-right text-sm">
                                                    <p className="tabular-nums">
                                                        {plan.subscriptions_count}
                                                    </p>
                                                    {plan.active_subscriptions_count >
                                                        0 && (
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                            {
                                                                plan.active_subscriptions_count
                                                            }{' '}
                                                            active
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            plan.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {plan.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <PlanRowActions
                                                        id={plan.id}
                                                        subscriptionsCount={
                                                            plan.subscriptions_count
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <DataTablePagination paginator={plans} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminPlansIndex.layout = {
    breadcrumbs: [{ title: 'Plans', href: plansIndex().url }],
};

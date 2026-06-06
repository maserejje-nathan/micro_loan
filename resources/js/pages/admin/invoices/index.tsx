import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    CheckCircle2,
    FileText,
    Plus,
    Search,
} from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import { BillingStatusBadge } from '@/components/admin/billing-status-badge';
import { InvoiceRowActions } from '@/components/admin/invoice-row-actions';
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
import { create, index as invoicesIndex } from '@/routes/admin/invoices';
import { show as organizationShow } from '@/routes/admin/organizations';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type Invoice = {
    id: number;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    organization: { id: number; name: string; slug: string };
    due_at: string | null;
    paid_at: string | null;
    created_at: string;
};

const STATUS_FILTERS = [
    { key: null, label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'paid', label: 'Paid' },
    { key: 'draft', label: 'Draft' },
    { key: 'void', label: 'Void' },
] as const;

function formatDateTime(dateTime: string | null): string {
    if (!dateTime) {
        return '—';
    }

    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function isOverdue(dueAt: string | null, status: string): boolean {
    if (!dueAt || status === 'paid' || status === 'void') {
        return false;
    }

    return new Date(dueAt).getTime() < Date.now();
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
        ? invoicesIndex.url({ query })
        : invoicesIndex.url();
}

export default function AdminInvoicesIndex({
    invoices,
    stats,
    filters,
}: {
    invoices: Paginated<Invoice>;
    stats: {
        total: number;
        open: number;
        overdue: number;
        paid: number;
        draft: number;
        outstanding_amount: number;
    };
    filters: { status: string | null; search: string | null };
}) {
    const total = paginatorTotal(invoices);
    const [search, setSearch] = useState(filters.search ?? '');
    const hasFilters = Boolean(filters.status || filters.search);

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
        router.get(invoicesIndex.url());
    };

    return (
        <>
            <Head title="Invoices" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Invoices
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Platform billing, collections, and payment tracking
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url}>
                            <Plus className="mr-2 size-4" />
                            Create invoice
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Outstanding"
                        value={formatMoney(stats.outstanding_amount, 'UGX')}
                        description={`${stats.open} open · ${stats.overdue} overdue`}
                        icon={Banknote}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        href={filterUrl('open', filters.search)}
                    />
                    <StatCard
                        title="Overdue"
                        value={String(stats.overdue)}
                        icon={AlertTriangle}
                        accentClassName="bg-destructive/10 text-destructive"
                        href={filterUrl('overdue', filters.search)}
                    />
                    <StatCard
                        title="Paid"
                        value={String(stats.paid)}
                        description={`${stats.draft} drafts`}
                        icon={CheckCircle2}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        href={filterUrl('paid', filters.search)}
                    />
                    <StatCard
                        title="Total invoices"
                        value={String(stats.total)}
                        icon={FileText}
                    />
                </div>

                <Card>
                    <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Billing invoices</CardTitle>
                            <CardDescription>
                                {total}{' '}
                                {total === 1 ? 'invoice' : 'invoices'}
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
                                    placeholder="Invoice # or org…"
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
                                        : filter.key === 'open'
                                          ? stats.open
                                          : filter.key === 'overdue'
                                            ? stats.overdue
                                            : filter.key === 'paid'
                                              ? stats.paid
                                              : filter.key === 'draft'
                                                ? stats.draft
                                                : 0;

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
                                            {filter.key !== 'void' && (
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
                                            )}
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

                        {invoices.data.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title={
                                    hasFilters
                                        ? 'No matching invoices'
                                        : 'No invoices yet'
                                }
                                description={
                                    hasFilters
                                        ? 'Try a different status or search term.'
                                        : 'Create a manual invoice for an organization.'
                                }
                                action={
                                    <Button asChild>
                                        <Link href={create().url}>
                                            Create invoice
                                        </Link>
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="-mx-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice</TableHead>
                                            <TableHead>Organization</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Due
                                            </TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Paid
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Amount
                                            </TableHead>
                                            <TableHead className="w-12 text-right">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.data.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell>
                                                    <p className="font-mono text-sm font-medium">
                                                        {
                                                            invoice.invoice_number
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(
                                                            invoice.created_at,
                                                        )}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={organizationShow.url(
                                                            invoice.organization
                                                                .id,
                                                        )}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {
                                                            invoice.organization
                                                                .name
                                                        }
                                                    </Link>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {
                                                            invoice.organization
                                                                .slug
                                                        }
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <BillingStatusBadge
                                                        status={invoice.status}
                                                        type="invoice"
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        'hidden text-sm md:table-cell',
                                                        isOverdue(
                                                            invoice.due_at,
                                                            invoice.status,
                                                        ) &&
                                                            'font-medium text-amber-600 dark:text-amber-400',
                                                    )}
                                                >
                                                    {formatDateTime(
                                                        invoice.due_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                                                    {formatDateTime(
                                                        invoice.paid_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums">
                                                    {formatMoney(
                                                        invoice.amount,
                                                        invoice.currency,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <InvoiceRowActions
                                                        id={invoice.id}
                                                        status={invoice.status}
                                                        organizationId={
                                                            invoice.organization
                                                                .id
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <DataTablePagination paginator={invoices} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminInvoicesIndex.layout = {
    breadcrumbs: [{ title: 'Invoices', href: invoicesIndex().url }],
};

import { Head } from '@inertiajs/react';
import { Banknote, FileText, Wallet } from 'lucide-react';
import { BillingStatusBadge } from '@/components/admin/billing-status-badge';
import { UsageMeter } from '@/components/billing/usage-meter';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
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
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type Subscription = {
    status: string;
    plan: {
        name: string;
        slug: string;
        price: number;
        currency: string;
        billing_interval: string;
        features: string[];
        max_users: number | null;
        max_customers: number | null;
        max_active_loans: number | null;
    };
    trial_ends_at: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
};

type Invoice = {
    id: number;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    due_at: string | null;
    paid_at: string | null;
};

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

export default function BillingSettings({
    subscription,
    usage,
    invoices,
}: {
    subscription: Subscription | null;
    usage: { users: number; customers: number; active_loans: number };
    invoices: Paginated<Invoice>;
}) {
    return (
        <>
            <Head title="Billing" />
            <div className="space-y-6">
                <Heading
                    title="Billing"
                    description="Your subscription, usage against plan limits, and invoices"
                />

                {!subscription && (
                    <Card variant="destructive">
                        <CardContent className="p-6">
                            <EmptyState
                                icon={Banknote}
                                title="No active subscription"
                                description="Contact your platform administrator to restore access or start a new plan."
                            />
                        </CardContent>
                    </Card>
                )}

                {subscription && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <StatCard
                                title="Current plan"
                                value={subscription.plan.name}
                                description={formatMoney(
                                    subscription.plan.price,
                                    subscription.plan.currency,
                                )}
                                icon={Wallet}
                            />
                            <StatCard
                                title="Billing cycle"
                                value={formatEnumLabel(
                                    subscription.plan.billing_interval,
                                )}
                                description={`Status: ${formatEnumLabel(subscription.status)}`}
                                icon={Banknote}
                            />
                            <Card>
                                <CardContent className="flex flex-col justify-center gap-2 p-5">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Subscription status
                                    </p>
                                    <BillingStatusBadge
                                        status={subscription.status}
                                        type="subscription"
                                    />
                                    {subscription.trial_ends_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Trial ends{' '}
                                            {formatDateTime(
                                                subscription.trial_ends_at,
                                            )}
                                        </p>
                                    )}
                                    {subscription.current_period_end && (
                                        <p className="text-xs text-muted-foreground">
                                            Period ends{' '}
                                            {formatDateTime(
                                                subscription.current_period_end,
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-base">
                                        Plan details
                                    </CardTitle>
                                    <CardDescription>
                                        {subscription.plan.slug} · billed{' '}
                                        {formatEnumLabel(
                                            subscription.plan.billing_interval,
                                        ).toLowerCase()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <p className="text-2xl font-semibold tabular-nums">
                                        {formatMoney(
                                            subscription.plan.price,
                                            subscription.plan.currency,
                                        )}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {' '}
                                            /{' '}
                                            {formatEnumLabel(
                                                subscription.plan
                                                    .billing_interval,
                                            ).toLowerCase()}
                                        </span>
                                    </p>
                                    {subscription.plan.features.length > 0 && (
                                        <ul className="flex flex-wrap gap-2">
                                            {subscription.plan.features.map(
                                                (feature) => (
                                                    <Badge
                                                        key={feature}
                                                        variant="secondary"
                                                    >
                                                        {feature}
                                                    </Badge>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                        <div>
                                            <dt className="text-muted-foreground">
                                                Period start
                                            </dt>
                                            <dd>
                                                {formatDateTime(
                                                    subscription.current_period_start,
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground">
                                                Period end
                                            </dt>
                                            <dd>
                                                {formatDateTime(
                                                    subscription.current_period_end,
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-base">
                                        Usage
                                    </CardTitle>
                                    <CardDescription>
                                        Consumption vs plan limits
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <UsageMeter
                                        label="Team members"
                                        used={usage.users}
                                        limit={subscription.plan.max_users}
                                    />
                                    <UsageMeter
                                        label="Customers"
                                        used={usage.customers}
                                        limit={subscription.plan.max_customers}
                                    />
                                    <UsageMeter
                                        label="Active loans"
                                        used={usage.active_loans}
                                        limit={
                                            subscription.plan.max_active_loans
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">Invoices</CardTitle>
                        <CardDescription>
                            {paginatorTotal(invoices)}{' '}
                            {paginatorTotal(invoices) === 1
                                ? 'invoice'
                                : 'invoices'}{' '}
                            on record
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {invoices.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={FileText}
                                    title="No invoices yet"
                                    description="Subscription renewals and manual charges appear here."
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden sm:table-cell">
                                            Due
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.data.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-mono text-sm">
                                                {invoice.invoice_number}
                                            </TableCell>
                                            <TableCell>
                                                <BillingStatusBadge
                                                    status={invoice.status}
                                                    type="invoice"
                                                />
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                                                {formatDateTime(invoice.due_at)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatMoney(
                                                    invoice.amount,
                                                    invoice.currency,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={invoices} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

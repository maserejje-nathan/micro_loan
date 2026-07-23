import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, HandCoins, Mail, Users, Wallet } from 'lucide-react';
import { BillingStatusBadge } from '@/components/admin/billing-status-badge';
import { SubscriptionPeriod } from '@/components/admin/subscription-period';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { FormField } from '@/components/form-field';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
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
import { index as invoicesIndex } from '@/routes/admin/invoices';
import { index as organizationsIndex } from '@/routes/admin/organizations';
import { update as updateSubscription } from '@/routes/admin/organizations/subscription';
import type { Paginated } from '@/types/pagination';

type Plan = { id: number; name: string; slug: string; price: number };

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function AdminOrganizationShow({
    organization,
    users,
    subscription,
    usage,
    invoices,
    plans,
    statuses,
}: {
    organization: {
        id: number;
        name: string;
        slug: string;
        subdomain: string | null;
        email: string | null;
        currency: string;
        created_at: string;
    };
    users: { id: number; name: string; email: string }[];
    subscription: {
        id: number;
        status: string;
        plan_id: number;
        plan_name: string;
        plan_price: number;
        billing_interval: string;
        trial_ends_at: string | null;
        current_period_end: string | null;
        canceled_at: string | null;
    } | null;
    usage: { users: number; customers: number; active_loans: number };
    invoices: Paginated<{
        id: number;
        invoice_number: string;
        amount: number;
        currency: string;
        status: string;
        due_at: string | null;
        paid_at: string | null;
    }>;
    plans: Plan[];
    statuses: string[];
}) {
    return (
        <>
            <Head title={organization.name} />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="-ml-2 w-fit"
                >
                    <Link href={organizationsIndex().url}>
                        <ArrowLeft className="size-4" />
                        Organizations
                    </Link>
                </Button>

                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {organization.name}
                                </h1>
                                {subscription ? (
                                    <BillingStatusBadge
                                        status={subscription.status}
                                        type="subscription"
                                    />
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        No subscription
                                    </span>
                                )}
                            </div>
                            <p className="font-mono text-sm text-muted-foreground">
                                {organization.slug}
                                {organization.subdomain &&
                                    ` · ${organization.subdomain}`}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span>{organization.currency}</span>
                                {organization.email && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="size-3.5" />
                                        {organization.email}
                                    </span>
                                )}
                                <span>
                                    Joined{' '}
                                    {formatDateTime(organization.created_at)}
                                </span>
                            </div>
                        </div>
                        {subscription && (
                            <div className="text-right text-sm">
                                <p className="text-muted-foreground">
                                    Current plan
                                </p>
                                <p className="font-medium">
                                    {subscription.plan_name}
                                </p>
                                <p className="text-muted-foreground tabular-nums">
                                    {formatMoney(
                                        subscription.plan_price,
                                        organization.currency,
                                    )}{' '}
                                    /{' '}
                                    {formatEnumLabel(
                                        subscription.billing_interval,
                                    ).toLowerCase()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Team members"
                        value={String(usage.users)}
                        icon={Users}
                    />
                    <StatCard
                        title="Customers"
                        value={String(usage.customers)}
                        icon={HandCoins}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                    <StatCard
                        title="Active loans"
                        value={String(usage.active_loans)}
                        icon={Wallet}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">
                            Manage subscription
                        </CardTitle>
                        <CardDescription>
                            Assign a plan and billing status for this tenant
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form
                            {...updateSubscription.form(organization.id)}
                            disableWhileProcessing
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <FormField
                                        id="subscription_plan_id"
                                        label="Plan"
                                        error={errors.subscription_plan_id}
                                        required
                                    >
                                        <NativeSelect
                                            id="subscription_plan_id"
                                            name="subscription_plan_id"
                                            defaultValue={
                                                subscription?.plan_id ??
                                                plans[0]?.id
                                            }
                                            aria-invalid={
                                                !!errors.subscription_plan_id
                                            }
                                        >
                                            {plans.map((plan) => (
                                                <option
                                                    key={plan.id}
                                                    value={plan.id}
                                                >
                                                    {plan.name} (
                                                    {formatMoney(
                                                        plan.price,
                                                        organization.currency,
                                                    )}
                                                    )
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </FormField>
                                    <FormField
                                        id="status"
                                        label="Status"
                                        error={errors.status}
                                        required
                                    >
                                        <NativeSelect
                                            id="status"
                                            name="status"
                                            defaultValue={
                                                subscription?.status ?? 'active'
                                            }
                                            aria-invalid={!!errors.status}
                                        >
                                            {statuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {formatEnumLabel(status)}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </FormField>
                                    <div className="flex items-end sm:col-span-2 lg:col-span-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="min-w-44"
                                        >
                                            {processing && <Spinner />}
                                            Update subscription
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                        {subscription && (
                            <div className="mt-6 max-w-sm">
                                <SubscriptionPeriod
                                    status={subscription.status}
                                    trialEndsAt={subscription.trial_ends_at}
                                    currentPeriodEnd={
                                        subscription.current_period_end
                                    }
                                    canceledAt={subscription.canceled_at}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Team members
                            </CardTitle>
                            <CardDescription>
                                {users.length}{' '}
                                {users.length === 1 ? 'member' : 'members'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {users.length === 0 ? (
                                <p className="p-6 text-sm text-muted-foreground">
                                    No team members.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle className="text-base">
                                        Recent invoices
                                    </CardTitle>
                                    <CardDescription>
                                        Latest billing for this organization
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={invoicesIndex().url}>
                                        All invoices
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {invoices.data.length === 0 ? (
                                <div className="p-6">
                                    <EmptyState
                                        icon={Wallet}
                                        title="No invoices yet"
                                        description="Invoices appear when subscriptions renew or you create manual charges."
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
                                                    {invoice.due_at
                                                        ? formatDateTime(
                                                              invoice.due_at,
                                                          )
                                                        : '—'}
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
            </div>
        </>
    );
}

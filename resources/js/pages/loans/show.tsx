import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Bell,
    Calendar,
    Download,
    FileText,
    Percent,
    TrendingUp,
    User,
    Wallet,
} from 'lucide-react';
import { sendPaymentReminder } from '@/actions/App/Http/Controllers/LoanController';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import { DisburseLoanFormFields } from '@/components/loans/disburse-loan-form-fields';
import { PaymentChannelBadge } from '@/components/payment-channel-badge';
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
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import type { MobileMoneySummary } from '@/lib/mobile-money-channel-label';
import { cn } from '@/lib/utils';
import { show as customerShow } from '@/routes/customers';
import { show as applicationShow } from '@/routes/loan-applications';
import { disburse, index as loansIndex } from '@/routes/loans';
import { create as createRepayment } from '@/routes/repayments';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type LoanCustomer = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    payment_reminder_channels: string[];
};

type LoanProduct = {
    id: number;
    name: string;
    code: string;
};

type LoanDetail = {
    id: number;
    reference_number: string;
    loan_application_id: number | null;
    principal: number;
    total_interest: number;
    total_repayable: number;
    outstanding_balance: number;
    total_repaid: number;
    repayment_progress: number;
    status: string;
    term_days: number;
    interest_rate: number;
    interest_type: string;
    repayment_frequency: string;
    disbursed_at: string | null;
    closed_at: string | null;
    customer: LoanCustomer;
    product: LoanProduct;
};

type ScheduleRow = {
    id: number;
    installment_number: number;
    due_date: string;
    principal_amount: number;
    interest_amount: number;
    total_amount: number;
    paid_amount: number;
    status: string;
    can_send_reminder: boolean;
};

type RepaymentRow = {
    id: number;
    reference_number: string;
    amount: number;
    paid_at: string;
    channel: string;
};

type DisbursementDetail = {
    amount: number;
    channel: string;
    status: string;
    mobile_money_reference: string | null;
    disbursed_at: string | null;
};

function formatDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    if (!value) {
        return null;
    }

    return (
        <div className="rounded-lg border border-border bg-muted px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{value}</dd>
        </div>
    );
}

export default function LoansShow({
    loan,
    scheduleSummary,
    schedules,
    repayments,
    disbursement,
    currency,
    paymentChannels,
    canDisburse,
    canRecordRepayment,
    statementUrl,
    mobileMoney,
    defaultDisbursementChannel,
}: {
    loan: LoanDetail;
    scheduleSummary: {
        total: number;
        paid: number;
        overdue: number;
    };
    schedules: Paginated<ScheduleRow>;
    repayments: Paginated<RepaymentRow>;
    disbursement: DisbursementDetail | null;
    currency: string;
    paymentChannels: string[];
    canDisburse: boolean;
    canRecordRepayment: boolean;
    statementUrl: string;
    mobileMoney: MobileMoneySummary;
    defaultDisbursementChannel: string;
}) {
    const page = usePage();
    const errors = page.props.errors as Record<string, string | undefined>;
    const flash = page.props.flash as
        | {
              success?: string;
              error?: string;
              warning?: string;
          }
        | undefined;

    return (
        <>
            <Head title={loan.reference_number} />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={loansIndex.url()}>
                            <ArrowLeft className="size-4" />
                            Loans
                        </Link>
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {loan.reference_number}
                                </h1>
                                <EntityStatusBadge
                                    status={loan.status}
                                    type="loan"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {loan.product.name}{' '}
                                <span className="font-mono text-xs">
                                    ({loan.product.code})
                                </span>
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                <Link
                                    href={customerShow.url(loan.customer.id)}
                                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                >
                                    <User className="size-3.5" />
                                    {loan.customer.name}
                                </Link>
                                <span className="text-muted-foreground">
                                    {loan.customer.phone}
                                </span>
                                {loan.customer.payment_reminder_channels
                                    .length > 0 && (
                                    <span className="text-muted-foreground">
                                        Reminders:{' '}
                                        {loan.customer.payment_reminder_channels
                                            .map((c) =>
                                                c === 'sms' ? 'SMS' : 'Email',
                                            )
                                            .join(', ')}
                                    </span>
                                )}
                            </div>
                            {flash?.success && (
                                <p className="text-sm text-green-600">
                                    {flash.success}
                                </p>
                            )}
                            {flash?.warning && (
                                <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                                    {flash.warning}
                                </p>
                            )}
                            {flash?.error && (
                                <p className="text-sm text-destructive">
                                    {flash.error}
                                </p>
                            )}
                            {loan.loan_application_id && (
                                <Link
                                    href={applicationShow.url(
                                        loan.loan_application_id,
                                    )}
                                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                    <FileText className="size-3.5" />
                                    View originating application
                                </Link>
                            )}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            {canRecordRepayment && (
                                <Button asChild>
                                    <Link
                                        href={createRepayment.url({
                                            query: { loan_id: loan.id },
                                        })}
                                    >
                                        Record repayment
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <a
                                    href={statementUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Download className="size-4" />
                                    PDF statement
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Principal"
                        value={formatMoney(loan.principal, currency)}
                        description="Disbursed amount"
                        icon={Wallet}
                    />
                    <StatCard
                        title="Outstanding"
                        value={formatMoney(loan.outstanding_balance, currency)}
                        description="Remaining balance"
                        icon={Banknote}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Total repayable"
                        value={formatMoney(loan.total_repayable, currency)}
                        description={`${formatMoney(loan.total_interest, currency)} interest`}
                        icon={Percent}
                    />
                    <StatCard
                        title="Repaid"
                        value={formatMoney(loan.total_repaid, currency)}
                        description={`${loan.repayment_progress}% of total`}
                        icon={TrendingUp}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                {loan.repayment_progress > 0 && loan.status === 'active' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Repayment progress</span>
                            <span>{loan.repayment_progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${Math.min(100, loan.repayment_progress)}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Loan terms
                            </CardTitle>
                            <CardDescription>
                                Product and schedule configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailItem
                                    label="Term"
                                    value={`${loan.term_days} days`}
                                />
                                <DetailItem
                                    label="Repayment frequency"
                                    value={formatEnumLabel(
                                        loan.repayment_frequency,
                                    )}
                                />
                                <DetailItem
                                    label="Interest rate"
                                    value={`${loan.interest_rate}% ${formatEnumLabel(loan.interest_type)}`}
                                />
                                <DetailItem
                                    label="Disbursed"
                                    value={
                                        loan.disbursed_at
                                            ? formatDate(loan.disbursed_at)
                                            : null
                                    }
                                />
                                <DetailItem
                                    label="Closed"
                                    value={
                                        loan.closed_at
                                            ? formatDate(loan.closed_at)
                                            : null
                                    }
                                />
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Schedule summary
                            </CardTitle>
                            <CardDescription>
                                {scheduleSummary.total} installments
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-6 pt-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Paid
                                </p>
                                <p className="text-2xl font-semibold">
                                    {scheduleSummary.paid}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Overdue
                                </p>
                                <p
                                    className={cn(
                                        'text-2xl font-semibold',
                                        scheduleSummary.overdue > 0 &&
                                            'text-destructive',
                                    )}
                                >
                                    {scheduleSummary.overdue}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pending
                                </p>
                                <p className="text-2xl font-semibold">
                                    {scheduleSummary.total -
                                        scheduleSummary.paid}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {disbursement && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Disbursement
                            </CardTitle>
                            <CardDescription>
                                How this loan was funded
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <DetailItem
                                    label="Amount"
                                    value={formatMoney(
                                        disbursement.amount,
                                        currency,
                                    )}
                                />
                                <DetailItem
                                    label="Channel"
                                    value={formatEnumLabel(
                                        disbursement.channel,
                                    )}
                                />
                                <DetailItem
                                    label="Status"
                                    value={formatEnumLabel(disbursement.status)}
                                />
                                <DetailItem
                                    label="Disbursed at"
                                    value={
                                        disbursement.disbursed_at
                                            ? formatDateTime(
                                                  disbursement.disbursed_at,
                                              )
                                            : null
                                    }
                                />
                                <DetailItem
                                    label="Mobile money reference"
                                    value={disbursement.mobile_money_reference}
                                />
                            </dl>
                        </CardContent>
                    </Card>
                )}

                {canDisburse && (
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Disburse loan
                            </CardTitle>
                            <CardDescription>
                                Release {formatMoney(loan.principal, currency)}{' '}
                                to {loan.customer.name}. Use mobile money to pay
                                out via {mobileMoney.driver_label}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form
                                {...disburse.form(loan.id)}
                                className="space-y-4"
                            >
                                <DisburseLoanFormFields
                                    errors={errors}
                                    paymentChannels={paymentChannels}
                                    defaultPhone={loan.customer.phone}
                                    mobileMoney={mobileMoney}
                                    defaultChannel={defaultDisbursementChannel}
                                />
                                <Button type="submit">Disburse loan</Button>
                            </Form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-base">
                                    Repayment schedule
                                </CardTitle>
                                <CardDescription>
                                    Installment due dates and payment status
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {schedules.data.length === 0 ? (
                            <EmptyState
                                icon={Calendar}
                                className="border-0"
                                title="No schedule yet"
                                description="Installments are generated when the loan is disbursed."
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            #
                                        </TableHead>
                                        <TableHead>Due date</TableHead>
                                        <TableHead className="text-right">
                                            Principal
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Interest
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Paid
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Reminder
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.data.map((schedule) => (
                                        <TableRow key={schedule.id}>
                                            <TableCell className="font-medium">
                                                {schedule.installment_number}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(schedule.due_date)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(
                                                    schedule.principal_amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(
                                                    schedule.interest_amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(
                                                    schedule.total_amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMoney(
                                                    schedule.paid_amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <EntityStatusBadge
                                                    status={schedule.status}
                                                    type="schedule"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {schedule.can_send_reminder ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(
                                                                sendPaymentReminder.url(
                                                                    {
                                                                        loan: loan.id,
                                                                        schedule:
                                                                            schedule.id,
                                                                    },
                                                                ),
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <Bell className="mr-1 size-3.5" />
                                                        Send
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={schedules} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">
                            Repayment history
                        </CardTitle>
                        <CardDescription>
                            {paginatorTotal(repayments) === 0
                                ? 'No payments recorded'
                                : `${paginatorTotal(repayments)} payment${paginatorTotal(repayments) === 1 ? '' : 's'}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {repayments.data.length === 0 ? (
                            <EmptyState
                                icon={Banknote}
                                className="border-0"
                                title="No repayments yet"
                                description={
                                    canRecordRepayment
                                        ? 'Record the first payment when the customer pays.'
                                        : 'Payments will appear here once recorded.'
                                }
                                action={
                                    canRecordRepayment ? (
                                        <Button asChild size="sm">
                                            <Link
                                                href={createRepayment.url({
                                                    query: {
                                                        loan_id: loan.id,
                                                    },
                                                })}
                                            >
                                                Record repayment
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Paid at</TableHead>
                                        <TableHead>Channel</TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {repayments.data.map((repayment) => (
                                        <TableRow key={repayment.id}>
                                            <TableCell className="font-mono text-sm">
                                                {repayment.reference_number}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(
                                                    repayment.paid_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <PaymentChannelBadge
                                                    channel={repayment.channel}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatMoney(
                                                    repayment.amount,
                                                    currency,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={repayments} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

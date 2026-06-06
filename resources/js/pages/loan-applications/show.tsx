import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Calendar,
    CheckCircle2,
    ClipboardList,
    FileText,
    Mail,
    Package,
    Phone,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import LoanApplicationController from '@/actions/App/Http/Controllers/LoanApplicationController';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import {
    LoanApplicationCollateralList
    
} from '@/components/loan-applications/loan-application-collateral-list';
import type {CollateralItem} from '@/components/loan-applications/loan-application-collateral-list';
import { DisburseLoanFormFields } from '@/components/loans/disburse-loan-form-fields';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import type { MobileMoneySummary } from '@/lib/mobile-money-channel-label';
import { cn } from '@/lib/utils';
import { show as customerShow } from '@/routes/customers';
import { index as applicationsIndex } from '@/routes/loan-applications';
import { show as loanShow } from '@/routes/loans';

type LoanEstimate = {
    principal: number;
    total_interest: number;
    processing_fee: number;
    total_repayable: number;
    installment_count: number;
    installment_amount: number;
};

type ProductDetail = {
    id: number;
    name: string;
    code: string;
    min_amount: number;
    max_amount: number;
    term_min_days: number;
    term_max_days: number;
    interest_rate: number;
    interest_type: string;
    repayment_frequency: string;
    processing_fee: number;
};

type LinkedLoan = {
    id: number;
    reference_number: string;
    status: string;
    principal: number;
    outstanding_balance: number;
};

type Application = {
    id: number;
    reference_number: string;
    requested_amount: number;
    approved_amount: number | null;
    term_days: number;
    purpose: string | null;
    status: string;
    rejection_reason: string | null;
    created_at: string;
    reviewed_at: string | null;
    reviewer_name: string | null;
    created_by_name: string | null;
    customer: { id: number; name: string; phone: string; email: string | null };
    product: ProductDetail;
    estimate: LoanEstimate;
    approved_estimate: LoanEstimate | null;
    loan: LinkedLoan | null;
    collaterals: CollateralItem[];
};

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

function LimitBar({
    label,
    value,
    min,
    max,
    currency,
    outOfRange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    currency: string;
    outOfRange: boolean;
}) {
    const span = max - min || 1;
    const pct = Math.min(100, Math.max(0, ((value - min) / span) * 100));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span
                    className={cn(
                        'font-medium',
                        outOfRange && 'text-amber-600 dark:text-amber-400',
                    )}
                >
                    {label === 'Term'
                        ? `${value} days`
                        : formatMoney(value, currency)}
                </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        outOfRange ? 'bg-amber-500' : 'bg-primary',
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                Allowed:{' '}
                {label === 'Term'
                    ? `${min}–${max} days`
                    : `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`}
            </p>
        </div>
    );
}

function EstimateSummary({
    estimate,
    currency,
    title,
}: {
    estimate: LoanEstimate;
    currency: string;
    title: string;
}) {
    return (
        <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {title}
            </p>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                    label="Principal"
                    value={formatMoney(estimate.principal, currency)}
                />
                <DetailItem
                    label="Total interest"
                    value={formatMoney(estimate.total_interest, currency)}
                />
                {estimate.processing_fee > 0 && (
                    <DetailItem
                        label="Processing fee"
                        value={formatMoney(estimate.processing_fee, currency)}
                    />
                )}
                <DetailItem
                    label="Total repayable"
                    value={formatMoney(estimate.total_repayable, currency)}
                />
                <DetailItem
                    label="Installments"
                    value={`${estimate.installment_count} × ${formatMoney(estimate.installment_amount, currency)}`}
                />
            </dl>
        </div>
    );
}

export default function LoanApplicationsShow({
    application,
    currency,
    canApprove,
    canDisburse,
    mobileMoney,
}: {
    application: Application;
    currency: string;
    canApprove: boolean;
    canDisburse: boolean;
    mobileMoney: MobileMoneySummary;
}) {
    const page = usePage();
    const errors = page.props.errors as Record<string, string | undefined>;
    const flash = page.props.flash as {
        success?: string;
        warning?: string;
        error?: string;
    } | undefined;

    const [disburseNow, setDisburseNow] = useState(
        canDisburse && mobileMoney.can_disburse,
    );

    const isDraft = application.status === 'draft';
    const isRejected = application.status === 'rejected';
    const isApproved = application.status === 'approved';
    const canReview =
        canApprove &&
        ['submitted', 'under_review'].includes(application.status);

    const termOutOfRange =
        application.term_days < application.product.term_min_days ||
        application.term_days > application.product.term_max_days;

    const amountOutOfRange =
        application.requested_amount < application.product.min_amount ||
        application.requested_amount > application.product.max_amount;

    const defaultApproveTerm = termOutOfRange
        ? application.product.term_min_days
        : application.term_days;

    const displayEstimate =
        application.approved_estimate ?? application.estimate;

    return (
        <>
            <Head title={application.reference_number} />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={applicationsIndex().url}>
                            <ArrowLeft className="size-4" />
                            Applications
                        </Link>
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {application.reference_number}
                                </h1>
                                <EntityStatusBadge
                                    status={application.status}
                                    type="loan_application"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {application.product.name}{' '}
                                <span className="font-mono text-xs">
                                    ({application.product.code})
                                </span>
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="size-3.5" />
                                    Submitted {formatDateTime(application.created_at)}
                                </span>
                                {application.created_by_name && (
                                    <span>By {application.created_by_name}</span>
                                )}
                            </div>
                            {(flash?.success || flash?.warning || flash?.error) && (
                                <div className="space-y-2">
                                    {flash.success && (
                                        <p className="text-sm text-green-600">
                                            {flash.success}
                                        </p>
                                    )}
                                    {flash.warning && (
                                        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                                            {flash.warning}
                                        </p>
                                    )}
                                    {flash.error && (
                                        <p className="text-sm text-destructive">
                                            {flash.error}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            {application.loan && (
                                <Button asChild>
                                    <Link href={loanShow.url(application.loan.id)}>
                                        <Banknote className="mr-2 size-4" />
                                        View loan
                                    </Link>
                                </Button>
                            )}
                            {isDraft && (
                                <Form
                                    {...LoanApplicationController.submit.form(
                                        application.id,
                                    )}
                                >
                                    <Button type="submit">Submit for review</Button>
                                </Form>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Requested"
                        value={formatMoney(
                            application.requested_amount,
                            currency,
                        )}
                        description="Principal amount"
                        icon={Banknote}
                    />
                    <StatCard
                        title="Term"
                        value={`${application.term_days} days`}
                        description={`${application.product.term_min_days}–${application.product.term_max_days} allowed`}
                        icon={Calendar}
                    />
                    <StatCard
                        title="Est. repayable"
                        value={formatMoney(
                            displayEstimate.total_repayable,
                            currency,
                        )}
                        description={
                            application.approved_amount
                                ? 'Based on approved amount'
                                : 'Based on request'
                        }
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Est. installment"
                        value={formatMoney(
                            displayEstimate.installment_amount,
                            currency,
                        )}
                        description={`${displayEstimate.installment_count} payments · ${formatEnumLabel(application.product.repayment_frequency)}`}
                        icon={Package}
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="text-base">
                                    Borrower
                                </CardTitle>
                                <CardDescription>
                                    Customer linked to this application
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                                <Link
                                    href={customerShow.url(application.customer.id)}
                                    className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                                >
                                    <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                                        <User className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {application.customer.name}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            View customer profile
                                        </p>
                                    </div>
                                </Link>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="size-4 shrink-0" />
                                        <span>{application.customer.phone}</span>
                                    </div>
                                    {application.customer.email && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="size-4 shrink-0" />
                                            <span>{application.customer.email}</span>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="text-base">
                                    Collateral
                                </CardTitle>
                                <CardDescription>
                                    Security pledged against this application
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <LoanApplicationCollateralList
                                    collaterals={application.collaterals}
                                    currency={currency}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="text-base">
                                    Application details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {application.purpose ? (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Purpose
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed">
                                            {application.purpose}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No purpose provided.
                                    </p>
                                )}

                                <EstimateSummary
                                    estimate={application.estimate}
                                    currency={currency}
                                    title="Estimate (requested)"
                                />

                                {application.approved_estimate && (
                                    <EstimateSummary
                                        estimate={application.approved_estimate}
                                        currency={currency}
                                        title="Estimate (approved)"
                                    />
                                )}

                                {isRejected && application.rejection_reason && (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                                        <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                                            <XCircle className="size-4" />
                                            Rejection reason
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {application.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {application.loan && (
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="text-base">
                                        Linked loan
                                    </CardTitle>
                                    <CardDescription>
                                        Created when this application was approved
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <dl className="grid gap-3 sm:grid-cols-2">
                                        <DetailItem
                                            label="Loan reference"
                                            value={
                                                application.loan.reference_number
                                            }
                                        />
                                        <DetailItem
                                            label="Status"
                                            value={formatEnumLabel(
                                                application.loan.status,
                                            )}
                                        />
                                        <DetailItem
                                            label="Principal"
                                            value={formatMoney(
                                                application.loan.principal,
                                                currency,
                                            )}
                                        />
                                        <DetailItem
                                            label="Outstanding"
                                            value={formatMoney(
                                                application.loan.outstanding_balance,
                                                currency,
                                            )}
                                        />
                                    </dl>
                                    <Button variant="outline" className="mt-4" asChild>
                                        <Link
                                            href={loanShow.url(application.loan.id)}
                                        >
                                            <FileText className="mr-2 size-4" />
                                            Open loan
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="text-base">
                                    Product & limits
                                </CardTitle>
                                <CardDescription>
                                    {application.product.interest_rate}%{' '}
                                    {formatEnumLabel(
                                        application.product.interest_type,
                                    )}{' '}
                                    ·{' '}
                                    {formatEnumLabel(
                                        application.product.repayment_frequency,
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <LimitBar
                                    label="Amount"
                                    value={application.requested_amount}
                                    min={application.product.min_amount}
                                    max={application.product.max_amount}
                                    currency={currency}
                                    outOfRange={amountOutOfRange}
                                />
                                <LimitBar
                                    label="Term"
                                    value={application.term_days}
                                    min={application.product.term_min_days}
                                    max={application.product.term_max_days}
                                    currency={currency}
                                    outOfRange={termOutOfRange}
                                />
                                {application.approved_amount != null &&
                                    application.approved_amount !==
                                        application.requested_amount && (
                                        <DetailItem
                                            label="Approved amount"
                                            value={formatMoney(
                                                application.approved_amount,
                                                currency,
                                            )}
                                        />
                                    )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b">
                                <CardTitle className="text-base">
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6 text-sm">
                                <div className="flex gap-3">
                                    <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                                    <div>
                                        <p className="font-medium">Created</p>
                                        <p className="text-muted-foreground">
                                            {formatDateTime(application.created_at)}
                                        </p>
                                    </div>
                                </div>
                                {application.reviewed_at && (
                                    <div className="flex gap-3">
                                        <div
                                            className={cn(
                                                'mt-1 size-2 shrink-0 rounded-full',
                                                isApproved
                                                    ? 'bg-green-500'
                                                    : 'bg-destructive',
                                            )}
                                        />
                                        <div>
                                            <p className="font-medium">
                                                {isApproved ? 'Approved' : 'Reviewed'}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDateTime(
                                                    application.reviewed_at,
                                                )}
                                                {application.reviewer_name &&
                                                    ` · ${application.reviewer_name}`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {canReview && (
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-primary" />
                                <div>
                                    <CardTitle className="text-base">
                                        Review application
                                    </CardTitle>
                                    <CardDescription>
                                        Approve to create a loan pending disbursement,
                                        or reject with a reason.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {(termOutOfRange || amountOutOfRange) && (
                                <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                                    This request is outside the product limits.
                                    Adjust the approved amount and/or term before
                                    approving.
                                </p>
                            )}

                            <Form
                                {...LoanApplicationController.approve.form(
                                    application.id,
                                )}
                                className="space-y-6"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="approved_amount">
                                            Approved amount
                                        </Label>
                                        <Input
                                            id="approved_amount"
                                            name="approved_amount"
                                            type="number"
                                            min={application.product.min_amount}
                                            max={application.product.max_amount}
                                            defaultValue={
                                                amountOutOfRange
                                                    ? undefined
                                                    : application.requested_amount
                                            }
                                            placeholder={String(
                                                application.requested_amount,
                                            )}
                                            aria-invalid={!!errors.approved_amount}
                                            className="h-10"
                                        />
                                        {errors.approved_amount && (
                                            <p className="text-sm text-destructive">
                                                {errors.approved_amount}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {formatMoney(
                                                application.product.min_amount,
                                                currency,
                                            )}{' '}
                                            –{' '}
                                            {formatMoney(
                                                application.product.max_amount,
                                                currency,
                                            )}
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="term_days">Term (days)</Label>
                                        <Input
                                            id="term_days"
                                            name="term_days"
                                            type="number"
                                            min={application.product.term_min_days}
                                            max={application.product.term_max_days}
                                            defaultValue={defaultApproveTerm}
                                            required
                                            aria-invalid={!!errors.term_days}
                                            className="h-10"
                                        />
                                        {errors.term_days && (
                                            <p className="text-sm text-destructive">
                                                {errors.term_days}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {application.product.term_min_days}–
                                            {application.product.term_max_days} days
                                        </p>
                                    </div>
                                </div>

                                {canDisburse && (
                                    <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted p-4">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="disburse_via_mobile_money"
                                                name="disburse_via_mobile_money"
                                                value="1"
                                                checked={disburseNow}
                                                disabled={!mobileMoney.can_disburse}
                                                onCheckedChange={(checked) =>
                                                    setDisburseNow(checked === true)
                                                }
                                            />
                                            <div className="grid gap-1">
                                                <Label
                                                    htmlFor="disburse_via_mobile_money"
                                                    className="cursor-pointer font-medium"
                                                >
                                                    Disburse via mobile money on approval
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Send funds immediately using{' '}
                                                    {mobileMoney.driver_label}.
                                                    {!mobileMoney.can_disburse &&
                                                        ' Configure Yo! Payments in platform settings first.'}
                                                </p>
                                            </div>
                                        </div>
                                        {disburseNow && (
                                            <DisburseLoanFormFields
                                                errors={errors}
                                                paymentChannels={['mobile_money']}
                                                defaultPhone={
                                                    application.customer.phone
                                                }
                                                mobileMoney={mobileMoney}
                                                mobileMoneyOnly
                                            />
                                        )}
                                    </div>
                                )}

                                <Button type="submit" size="lg">
                                    {disburseNow
                                        ? 'Approve & disburse'
                                        : 'Approve application'}
                                </Button>
                            </Form>

                            <Separator />

                            <Form
                                {...LoanApplicationController.reject.form(
                                    application.id,
                                )}
                                className="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Rejection reason</Label>
                                    <Textarea
                                        id="reason"
                                        name="reason"
                                        rows={3}
                                        required
                                        placeholder="Explain why this application cannot be approved…"
                                        aria-invalid={!!errors.reason}
                                    />
                                    {errors.reason && (
                                        <p className="text-sm text-destructive">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>
                                <Button type="submit" variant="destructive">
                                    Reject application
                                </Button>
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

LoanApplicationsShow.layout = {
    breadcrumbs: [
        { title: 'Applications', href: applicationsIndex().url },
    ],
};

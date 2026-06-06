import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    ClipboardList,
    FileText,
    Send,
    Wallet,
} from 'lucide-react';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import {
    LoanApplicationCollateralList
    
} from '@/components/loan-applications/loan-application-collateral-list';
import type {CollateralItem} from '@/components/loan-applications/loan-application-collateral-list';
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
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';

type Props = {
    application: {
        id: number;
        reference_number: string;
        product_name: string;
        product_code: string;
        requested_amount: number;
        approved_amount: number | null;
        term_days: number;
        purpose: string | null;
        status: string;
        rejection_reason: string | null;
        reviewed_at: string | null;
        created_at: string;
        loan_id: number | null;
        collaterals: CollateralItem[];
    };
    product: {
        min_amount: number;
        max_amount: number;
        term_min_days: number;
        term_max_days: number;
    };
    currency: string;
    canSubmit: boolean;
};

const steps = [
    { key: 'draft', label: 'Draft' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under review' },
    { key: 'decision', label: 'Decision' },
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

function stepIndex(status: string): number {
    switch (status) {
        case 'draft':
            return 0;
        case 'submitted':
            return 1;
        case 'under_review':
            return 2;
        case 'approved':
        case 'rejected':
            return 3;
        default:
            return 0;
    }
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

function ApplicationProgress({ status }: { status: string }) {
    const current = stepIndex(status);
    const decisionLabel =
        status === 'approved'
            ? 'Approved'
            : status === 'rejected'
              ? 'Rejected'
              : 'Decision';

    return (
        <div className="grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
                const isDecision = step.key === 'decision';
                const label = isDecision ? decisionLabel : step.label;
                const isComplete = index < current;
                const isCurrent = index === current;

                return (
                    <div key={step.key} className="flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                'flex size-8 items-center justify-center rounded-full border-2 text-xs font-medium',
                                isComplete &&
                                    'border-primary bg-primary text-primary-foreground',
                                isCurrent &&
                                    !isComplete &&
                                    'border-primary text-primary',
                                !isComplete &&
                                    !isCurrent &&
                                    'border-muted-foreground/30 text-muted-foreground',
                                isDecision &&
                                    status === 'rejected' &&
                                    isCurrent &&
                                    'border-destructive text-destructive',
                                isDecision &&
                                    status === 'approved' &&
                                    (isComplete || isCurrent) &&
                                    'border-emerald-600 bg-emerald-600 text-white',
                            )}
                        >
                            {isComplete || (isDecision && status === 'approved') ? (
                                <CheckCircle2 className="size-4" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span
                            className={cn(
                                'text-center text-xs',
                                isCurrent
                                    ? 'font-medium text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function PortalApplicationShow({
    application,
    product,
    currency,
    canSubmit,
}: Props) {
    const flash = usePage().props.flash as { success?: string };

    const amountInRange =
        application.requested_amount >= product.min_amount &&
        application.requested_amount <= product.max_amount;
    const termInRange =
        application.term_days >= product.term_min_days &&
        application.term_days <= product.term_max_days;

    return (
        <>
            <Head title={application.reference_number} />
            <PortalPage>
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
                        {flash.success}
                    </div>
                )}

                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                                    {application.reference_number}
                                </h1>
                                <EntityStatusBadge
                                    status={application.status}
                                    type="loan_application"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {application.product_name}{' '}
                                <span className="font-mono text-xs">
                                    ({application.product_code})
                                </span>
                            </p>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="size-3.5" />
                                Created {formatDateTime(application.created_at)}
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                            {canSubmit && (
                                <Form
                                    action={`/portal/applications/${application.id}/submit`}
                                    method="post"
                                >
                                    {({ processing }) => (
                                        <Button type="submit" disabled={processing}>
                                            <Send className="mr-2 size-4" />
                                            Submit for review
                                        </Button>
                                    )}
                                </Form>
                            )}
                            {application.loan_id && (
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/portal/loans/${application.loan_id}`}
                                    >
                                        <Wallet className="mr-2 size-4" />
                                        View loan
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">
                            Application progress
                        </CardTitle>
                        <CardDescription>
                            Where your request is in the review process
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ApplicationProgress status={application.status} />
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                        title="Requested"
                        value={formatMoney(
                            application.requested_amount,
                            currency,
                        )}
                        description={`${application.term_days} day term`}
                        icon={FileText}
                    />
                    {application.approved_amount !== null && (
                        <StatCard
                            title="Approved"
                            value={formatMoney(
                                application.approved_amount,
                                currency,
                            )}
                            description="Lender approved amount"
                            icon={CheckCircle2}
                            accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        />
                    )}
                    <StatCard
                        title="Product limits"
                        value={formatMoney(product.min_amount, currency)}
                        description={`Up to ${formatMoney(product.max_amount, currency)}`}
                        icon={ClipboardList}
                        accentClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    />
                </div>

                {(!amountInRange || !termInRange) && application.status === 'draft' && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
                        Your request is outside this product&apos;s allowed range
                        (amount{' '}
                        {formatMoney(product.min_amount, currency)}–
                        {formatMoney(product.max_amount, currency)}, term{' '}
                        {product.term_min_days}–{product.term_max_days} days).
                        Your lender may adjust it during review.
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">
                                Request details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                            <DetailItem
                                label="Requested amount"
                                value={formatMoney(
                                    application.requested_amount,
                                    currency,
                                )}
                            />
                            <DetailItem
                                label="Term"
                                value={`${application.term_days} days`}
                            />
                            <DetailItem
                                label="Allowed amount"
                                value={`${formatMoney(product.min_amount, currency)} – ${formatMoney(product.max_amount, currency)}`}
                            />
                            <DetailItem
                                label="Allowed term"
                                value={`${product.term_min_days} – ${product.term_max_days} days`}
                            />
                            {application.purpose && (
                                <div className="sm:col-span-2">
                                    <DetailItem
                                        label="Purpose"
                                        value={application.purpose}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-base">Review</CardTitle>
                            <CardDescription>
                                Updates from your lender
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                            {application.reviewed_at ? (
                                <DetailItem
                                    label="Reviewed at"
                                    value={formatDateTime(application.reviewed_at)}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {application.status === 'draft'
                                        ? 'Submit your application to start the review process.'
                                        : 'Your lender is reviewing this application.'}
                                </p>
                            )}
                            {application.rejection_reason && (
                                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                                    <p className="text-xs font-medium text-destructive">
                                        Rejection reason
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {application.rejection_reason}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">Collateral</CardTitle>
                        <CardDescription>
                            Security you pledged for this application
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <LoanApplicationCollateralList
                            collaterals={application.collaterals}
                            currency={currency}
                        />
                    </CardContent>
                </Card>

                <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
                    <Link href="/portal/applications">← Back to applications</Link>
                </Button>
            </PortalPage>
        </>
    );
}

PortalApplicationShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Overview', href: '/portal' },
        { title: 'Applications', href: '/portal/applications' },
        {
            title: props.application.reference_number,
            href: `/portal/applications/${props.application.id}`,
        },
    ],
});

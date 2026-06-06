import { Form, Head, Link } from '@inertiajs/react';
import { Banknote, Wallet } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { FormActions } from '@/components/form-actions';
import { FormPageShell } from '@/components/form-page-shell';
import { RepaymentFormFields } from '@/components/repayments/repayment-form-fields';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatMoney } from '@/lib/format-money';
import type { MobileMoneySummary } from '@/lib/mobile-money-channel-label';
import { index as loansIndex } from '@/routes/loans';
import { create, index, store } from '@/routes/repayments';

type LoanOption = {
    id: number;
    reference_number: string;
    customer_id: number;
    customer_name: string;
    customer_phone?: string;
    outstanding_balance: number;
    total_repayable: number;
};

type SelectedLoan = LoanOption;

type RepaymentFormValues = {
    loan_id?: number | string;
    amount?: number | string;
    channel?: string;
    phone?: string;
    provider?: string;
};

export default function RepaymentsCreate({
    loans,
    selectedLoan,
    currency,
    paymentChannels,
    values,
    canRecordRepayment,
    mobileMoney,
    defaultPaymentChannel,
}: {
    loans: LoanOption[];
    selectedLoan: SelectedLoan | null;
    currency: string;
    paymentChannels: string[];
    values?: RepaymentFormValues;
    canRecordRepayment: boolean;
    mobileMoney: MobileMoneySummary;
    defaultPaymentChannel: string;
}) {
    const totalOutstanding = loans.reduce(
        (sum, loan) => sum + loan.outstanding_balance,
        0,
    );

    if (!canRecordRepayment) {
        return (
            <>
                <Head title="Record repayment" />
                <FormPageShell
                    backHref={index().url}
                    backLabel="Back to repayments"
                    title="Record repayment"
                    description="You do not have permission to record payments."
                >
                    <EmptyState
                        icon={Banknote}
                        title="Permission required"
                        description="Ask an administrator to grant repayments.manage so you can record payments."
                        action={
                            <Button variant="outline" asChild>
                                <Link href={index().url}>
                                    Back to repayments
                                </Link>
                            </Button>
                        }
                    />
                </FormPageShell>
            </>
        );
    }

    if (loans.length === 0) {
        return (
            <>
                <Head title="Record repayment" />
                <FormPageShell
                    backHref={index().url}
                    backLabel="Back to repayments"
                    title="Record repayment"
                    description="There are no active loans with a balance to collect."
                >
                    <EmptyState
                        icon={Wallet}
                        title="No loans ready for collection"
                        description="Disburse an approved application first, then return here to record payments."
                        action={
                            <Button variant="outline" asChild>
                                <Link href={loansIndex().url}>View loans</Link>
                            </Button>
                        }
                    />
                </FormPageShell>
            </>
        );
    }

    return (
        <>
            <Head title="Record repayment" />
            <FormPageShell
                backHref={index().url}
                backLabel="Back to repayments"
                title="Record repayment"
                description={`Apply a payment to an active loan. Collect via ${mobileMoney.driver_label} or record cash/bank.`}
                cardTitle="Payment details"
                cardDescription="Use mobile money to pull repayment from the borrower’s phone via Yo! Payments when configured."
            >
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <Card variant="muted" className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Collectible loans
                            </CardTitle>
                            <CardDescription>
                                Active with outstanding balance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold">
                                {loans.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card variant="muted" className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total outstanding
                            </CardTitle>
                            <CardDescription>
                                Across listed loans · {currency}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                                {formatMoney(totalOutstanding, currency)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {selectedLoan && (
                    <p className="mb-4 text-sm text-muted-foreground">
                        Recording payment for{' '}
                        <span className="font-medium text-foreground">
                            {selectedLoan.reference_number}
                        </span>{' '}
                        ({selectedLoan.customer_name})
                    </p>
                )}

                <Form
                    {...store.form()}
                    disableWhileProcessing
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <RepaymentFormFields
                                errors={errors}
                                loans={loans}
                                paymentChannels={paymentChannels}
                                currency={currency}
                                mobileMoney={mobileMoney}
                                defaultChannel={defaultPaymentChannel}
                                values={values}
                            />
                            <FormActions
                                processing={processing}
                                cancelHref={index().url}
                                submitLabel="Record payment"
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

RepaymentsCreate.layout = {
    breadcrumbs: [
        { title: 'Repayments', href: '/repayments' },
        { title: 'Record', href: create().url },
    ],
};

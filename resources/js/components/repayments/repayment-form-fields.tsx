import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { FormField } from '@/components/form-field';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatMoney } from '@/lib/format-money';
import {
    MOBILE_MONEY_CHANNEL,
    mobileMoneyChannelLabel,
} from '@/lib/mobile-money-channel-label';
import type { MobileMoneySummary } from '@/lib/mobile-money-channel-label';
import { cn } from '@/lib/utils';
import { show as loanShow } from '@/routes/loans';

export { MOBILE_MONEY_CHANNEL };

type LoanOption = {
    id: number;
    reference_number: string;
    customer_id: number;
    customer_name: string;
    customer_phone?: string;
    outstanding_balance: number;
    total_repayable: number;
};

type RepaymentFormFieldsProps = {
    errors: Record<string, string | undefined>;
    loans: LoanOption[];
    paymentChannels: string[];
    currency?: string;
    mobileMoney?: MobileMoneySummary;
    defaultChannel?: string;
    values?: {
        loan_id?: number | string;
        amount?: number | string;
        channel?: string;
        phone?: string;
        provider?: string;
    };
};

export function RepaymentFormFields({
    errors,
    loans,
    paymentChannels,
    currency = 'UGX',
    mobileMoney,
    defaultChannel,
    values,
}: RepaymentFormFieldsProps) {
    const initialLoanId = values?.loan_id ? String(values.loan_id) : '';
    const [loanId, setLoanId] = useState(initialLoanId);
    const initialChannel =
        values?.channel ??
        (defaultChannel && paymentChannels.includes(defaultChannel)
            ? defaultChannel
            : (paymentChannels.find((c) => c === MOBILE_MONEY_CHANNEL) ??
              paymentChannels[0] ??
              'cash'));
    const [channel, setChannel] = useState(initialChannel);
    const isMobileMoney = channel === MOBILE_MONEY_CHANNEL;
    const mmBlocked = isMobileMoney && mobileMoney && !mobileMoney.can_disburse;

    const selectedLoan = useMemo(
        () => loans.find((loan) => String(loan.id) === loanId),
        [loans, loanId],
    );

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Loan & amount
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Only active loans with an outstanding balance are
                        listed.
                    </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <FormField
                        id="loan_id"
                        label="Loan"
                        error={errors.loan_id}
                        required
                    >
                        <NativeSelect
                            id="loan_id"
                            name="loan_id"
                            value={loanId}
                            required
                            aria-invalid={!!errors.loan_id}
                            onChange={(event) => setLoanId(event.target.value)}
                        >
                            <option value="">Select loan</option>
                            {loans.map((loan) => (
                                <option key={loan.id} value={loan.id}>
                                    {loan.reference_number} —{' '}
                                    {loan.customer_name} (
                                    {formatMoney(
                                        loan.outstanding_balance,
                                        currency,
                                    )}{' '}
                                    outstanding)
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>
                    <FormField
                        id="amount"
                        label="Payment amount"
                        error={errors.amount}
                        required
                        hint={
                            selectedLoan
                                ? `Maximum ${formatMoney(selectedLoan.outstanding_balance, currency)}`
                                : undefined
                        }
                    >
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            min={1}
                            max={selectedLoan?.outstanding_balance}
                            defaultValue={values?.amount ?? ''}
                            required
                            aria-invalid={!!errors.amount}
                            className="h-10"
                        />
                    </FormField>
                </div>

                {selectedLoan && (
                    <Card variant="muted" className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {selectedLoan.reference_number}
                            </CardTitle>
                            <CardDescription>
                                {selectedLoan.customer_name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-end justify-between gap-4 pt-0">
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Outstanding
                                    </dt>
                                    <dd className="font-semibold text-amber-600 dark:text-amber-400">
                                        {formatMoney(
                                            selectedLoan.outstanding_balance,
                                            currency,
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Total repayable
                                    </dt>
                                    <dd className="font-medium">
                                        {formatMoney(
                                            selectedLoan.total_repayable,
                                            currency,
                                        )}
                                    </dd>
                                </div>
                            </dl>
                            <Link
                                href={loanShow.url(selectedLoan.id)}
                                className="text-sm text-primary hover:underline"
                            >
                                View loan details
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Payment method
                    </p>
                    {isMobileMoney && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {mobileMoney?.uses_yo_payments
                                ? mobileMoney.can_disburse
                                    ? 'Pull funds from the borrower via Yo! Payments (acdepositfunds).'
                                    : 'Yo! Payments is not configured. Use cash/bank or add credentials in Platform settings.'
                                : 'Enter the mobile money number and network to record this collection.'}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        'grid gap-4',
                        isMobileMoney
                            ? 'sm:grid-cols-2 lg:grid-cols-3'
                            : 'max-w-md',
                    )}
                >
                    <FormField
                        id="channel"
                        label="Channel"
                        error={errors.channel}
                        required
                    >
                        <NativeSelect
                            id="channel"
                            name="channel"
                            value={channel}
                            required
                            aria-invalid={!!errors.channel}
                            onChange={(event) => setChannel(event.target.value)}
                        >
                            {paymentChannels.map((paymentChannel) => (
                                <option
                                    key={paymentChannel}
                                    value={paymentChannel}
                                >
                                    {mobileMoneyChannelLabel(
                                        paymentChannel,
                                        mobileMoney,
                                    )}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>

                    {isMobileMoney && (
                        <>
                            <FormField
                                id="phone"
                                label="Mobile money phone number"
                                error={errors.phone}
                                required
                                hint="Number that will be debited"
                            >
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={
                                        values?.phone ??
                                        selectedLoan?.customer_phone ??
                                        ''
                                    }
                                    key={`phone-${loanId}`}
                                    required
                                    placeholder="256700000000"
                                    aria-invalid={!!errors.phone}
                                    className="h-10"
                                />
                            </FormField>
                            <FormField
                                id="provider"
                                label="Network"
                                error={errors.provider}
                                required
                            >
                                <NativeSelect
                                    id="provider"
                                    name="provider"
                                    defaultValue={values?.provider ?? 'mtn'}
                                    required
                                    aria-invalid={!!errors.provider}
                                >
                                    <option value="mtn">MTN</option>
                                    <option value="airtel">Airtel</option>
                                </NativeSelect>
                            </FormField>
                        </>
                    )}
                </div>
                {mmBlocked && (
                    <p className="text-sm text-destructive" role="alert">
                        Yo! Payments is not configured. Choose another channel
                        or add API credentials under Platform settings.
                    </p>
                )}
            </section>
        </div>
    );
}

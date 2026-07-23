import { Calculator } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import { calculateLoanEstimate } from '@/lib/loan-calculator';
import type { InterestType, RepaymentFrequency } from '@/lib/loan-calculator';
import { cn } from '@/lib/utils';

export type LoanCalculatorProduct = {
    id: number;
    name: string;
    code: string;
    min_amount: number;
    max_amount: number;
    term_min_days: number;
    term_max_days: number;
    interest_rate: number;
    interest_type: InterestType;
    repayment_frequency: RepaymentFrequency;
    processing_fee: number;
};

export type LoanCalculatorDefaults = {
    principal: number;
    term_days: number;
    interest_rate: number;
    interest_type: InterestType;
    repayment_frequency: RepaymentFrequency;
    processing_fee: number;
};

export type LoanCalculatorConfig = {
    currency: string;
    products: LoanCalculatorProduct[];
    interestTypes: string[];
    repaymentFrequencies: string[];
    defaults: LoanCalculatorDefaults;
};

type LoanCalculatorWidgetProps = {
    config: LoanCalculatorConfig;
    className?: string;
    title?: string;
    description?: string;
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function parsePositiveInteger(value: string): number | null {
    const digits = value.replace(/\D/g, '');

    if (digits === '') {
        return null;
    }

    const parsed = Number.parseInt(digits, 10);

    return Number.isNaN(parsed) ? null : parsed;
}

export function LoanCalculatorWidget({
    config,
    className,
    title = 'Loan calculator',
    description = 'Estimate interest and repayments before you apply. Figures are indicative only.',
}: LoanCalculatorWidgetProps) {
    const {
        currency,
        products,
        interestTypes,
        repaymentFrequencies,
        defaults,
    } = config;

    const [productId, setProductId] = useState<string>(
        products[0] ? String(products[0].id) : '',
    );
    const [principalInput, setPrincipalInput] = useState(
        String(defaults.principal),
    );
    const [termInput, setTermInput] = useState(String(defaults.term_days));
    const [interestRate, setInterestRate] = useState(defaults.interest_rate);
    const [interestType, setInterestType] = useState<InterestType>(
        defaults.interest_type,
    );
    const [repaymentFrequency, setRepaymentFrequency] =
        useState<RepaymentFrequency>(defaults.repayment_frequency);
    const [processingFee, setProcessingFee] = useState(defaults.processing_fee);

    const selectedProduct = useMemo(
        () => products.find((p) => String(p.id) === productId) ?? null,
        [products, productId],
    );

    const bounds = selectedProduct
        ? {
              principalMin: selectedProduct.min_amount,
              principalMax: selectedProduct.max_amount,
              termMin: selectedProduct.term_min_days,
              termMax: selectedProduct.term_max_days,
          }
        : {
              principalMin: 1,
              principalMax: 100_000_000,
              termMin: 1,
              termMax: 3650,
          };

    const principalError = useMemo(() => {
        const parsed = parsePositiveInteger(principalInput);

        if (parsed === null) {
            return undefined;
        }

        if (parsed < bounds.principalMin) {
            return `Minimum loan amount is ${formatMoney(bounds.principalMin, currency)}.`;
        }

        if (parsed > bounds.principalMax) {
            return `Maximum loan amount is ${formatMoney(bounds.principalMax, currency)}.`;
        }

        return undefined;
    }, [principalInput, bounds.principalMin, bounds.principalMax, currency]);

    const principalValue = useMemo(() => {
        const parsed = parsePositiveInteger(principalInput);

        if (parsed === null) {
            return bounds.principalMin;
        }

        return clamp(parsed, bounds.principalMin, bounds.principalMax);
    }, [principalInput, bounds.principalMin, bounds.principalMax]);

    const termError = useMemo(() => {
        const parsed = parsePositiveInteger(termInput);

        if (parsed === null) {
            return undefined;
        }

        if (parsed < bounds.termMin) {
            return `Minimum term is ${bounds.termMin} days.`;
        }

        if (parsed > bounds.termMax) {
            return `Maximum term is ${bounds.termMax} days.`;
        }

        return undefined;
    }, [termInput, bounds.termMin, bounds.termMax]);

    const termDaysValue = useMemo(() => {
        const parsed = parsePositiveInteger(termInput);

        if (parsed === null) {
            return bounds.termMin;
        }

        return clamp(parsed, bounds.termMin, bounds.termMax);
    }, [termInput, bounds.termMin, bounds.termMax]);

    const estimate = useMemo(
        () =>
            calculateLoanEstimate({
                principal: principalValue,
                interestRate,
                interestType,
                termDays: termDaysValue,
                processingFee,
                repaymentFrequency,
            }),
        [
            principalValue,
            interestRate,
            interestType,
            termDaysValue,
            processingFee,
            repaymentFrequency,
        ],
    );

    const handleProductChange = (value: string) => {
        setProductId(value);
        const product = products.find((p) => String(p.id) === value);

        if (!product) {
            return;
        }

        const midPrincipal = Math.round(
            (product.min_amount + product.max_amount) / 2,
        );
        const midTerm = Math.round(
            (product.term_min_days + product.term_max_days) / 2,
        );

        setPrincipalInput(String(midPrincipal));
        setTermInput(String(midTerm));
        setInterestRate(product.interest_rate);
        setInterestType(product.interest_type);
        setRepaymentFrequency(product.repayment_frequency);
        setProcessingFee(product.processing_fee);
    };

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className="border-b bg-muted">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Calculator className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
                <div className="space-y-4">
                    {products.length > 0 && (
                        <FormField id="calc_product" label="Loan product">
                            <NativeSelect
                                id="calc_product"
                                value={productId}
                                onChange={(event) =>
                                    handleProductChange(event.target.value)
                                }
                                options={[
                                    ...products.map((product) => ({
                                        value: String(product.id),
                                        label: product.name,
                                    })),
                                ]}
                            />
                        </FormField>
                    )}

                    <FormField
                        id="calc_principal"
                        label={`Loan amount (${currency})`}
                        hint={
                            selectedProduct
                                ? `${formatMoney(bounds.principalMin, currency)} – ${formatMoney(bounds.principalMax, currency)}`
                                : undefined
                        }
                        error={principalError}
                    >
                        <Input
                            id="calc_principal"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder={String(bounds.principalMin)}
                            value={principalInput}
                            onChange={(event) =>
                                setPrincipalInput(
                                    event.target.value.replace(/\D/g, ''),
                                )
                            }
                            onBlur={() =>
                                setPrincipalInput(String(principalValue))
                            }
                            aria-invalid={!!principalError}
                            className="h-10 tabular-nums"
                        />
                    </FormField>

                    <FormField
                        id="calc_term"
                        label="Term (days)"
                        hint={
                            selectedProduct
                                ? `${bounds.termMin} – ${bounds.termMax} days`
                                : undefined
                        }
                        error={termError}
                    >
                        <Input
                            id="calc_term"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder={String(bounds.termMin)}
                            value={termInput}
                            onChange={(event) =>
                                setTermInput(
                                    event.target.value.replace(/\D/g, ''),
                                )
                            }
                            onBlur={() => setTermInput(String(termDaysValue))}
                            aria-invalid={!!termError}
                            className="h-10 tabular-nums"
                        />
                    </FormField>

                    {products.length === 0 && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField id="calc_rate" label="Interest rate (%)">
                                <Input
                                    id="calc_rate"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={interestRate}
                                    onChange={(event) =>
                                        setInterestRate(
                                            Number(event.target.value) || 0,
                                        )
                                    }
                                    className="h-10"
                                />
                            </FormField>
                            <FormField
                                id="calc_fee"
                                label={`Processing fee (${currency})`}
                            >
                                <Input
                                    id="calc_fee"
                                    type="number"
                                    min={0}
                                    value={processingFee}
                                    onChange={(event) =>
                                        setProcessingFee(
                                            Math.max(
                                                0,
                                                Number(event.target.value) || 0,
                                            ),
                                        )
                                    }
                                    className="h-10"
                                />
                            </FormField>
                            <FormField
                                id="calc_interest_type"
                                label="Interest type"
                            >
                                <NativeSelect
                                    id="calc_interest_type"
                                    value={interestType}
                                    onChange={(event) =>
                                        setInterestType(
                                            event.target.value as InterestType,
                                        )
                                    }
                                    options={interestTypes.map((type) => ({
                                        value: type,
                                        label: formatEnumLabel(type),
                                    }))}
                                />
                            </FormField>
                            <FormField
                                id="calc_frequency"
                                label="Repayment frequency"
                            >
                                <NativeSelect
                                    id="calc_frequency"
                                    value={repaymentFrequency}
                                    onChange={(event) =>
                                        setRepaymentFrequency(
                                            event.target
                                                .value as RepaymentFrequency,
                                        )
                                    }
                                    options={repaymentFrequencies.map(
                                        (frequency) => ({
                                            value: frequency,
                                            label: formatEnumLabel(frequency),
                                        }),
                                    )}
                                />
                            </FormField>
                        </div>
                    )}

                    {selectedProduct && (
                        <p className="text-xs text-muted-foreground">
                            {formatEnumLabel(selectedProduct.interest_type)}{' '}
                            interest at {selectedProduct.interest_rate}% ·{' '}
                            {formatEnumLabel(
                                selectedProduct.repayment_frequency,
                            )}{' '}
                            repayments
                            {selectedProduct.processing_fee > 0 &&
                                ` · ${formatMoney(selectedProduct.processing_fee, currency)} processing fee`}
                        </p>
                    )}
                </div>

                <div className="flex flex-col justify-center rounded-none border border-border bg-muted p-4 sm:p-5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Estimated breakdown
                    </p>
                    <dl className="mt-4 space-y-3">
                        <div className="flex items-center justify-between gap-4 text-sm">
                            <dt className="text-muted-foreground">Principal</dt>
                            <dd className="font-medium tabular-nums">
                                {formatMoney(estimate.principal, currency)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-sm">
                            <dt className="text-muted-foreground">Interest</dt>
                            <dd className="font-medium tabular-nums">
                                {formatMoney(estimate.total_interest, currency)}
                            </dd>
                        </div>
                        {estimate.processing_fee > 0 && (
                            <div className="flex items-center justify-between gap-4 text-sm">
                                <dt className="text-muted-foreground">
                                    Processing fee
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    {formatMoney(
                                        estimate.processing_fee,
                                        currency,
                                    )}
                                </dd>
                            </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between gap-4">
                            <dt className="font-medium">Total repayable</dt>
                            <dd className="text-lg font-semibold text-primary tabular-nums">
                                {formatMoney(
                                    estimate.total_repayable,
                                    currency,
                                )}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-sm">
                            <dt className="text-muted-foreground">
                                Est. per installment (
                                {estimate.installment_count}{' '}
                                {estimate.installment_count === 1
                                    ? 'payment'
                                    : 'payments'}
                                )
                            </dt>
                            <dd className="font-medium tabular-nums">
                                {formatMoney(
                                    estimate.installment_amount,
                                    currency,
                                )}
                            </dd>
                        </div>
                    </dl>
                    <p className="mt-4 text-xs text-muted-foreground">
                        Actual loan terms may differ after approval and
                        disbursement.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

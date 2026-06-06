import type { ReactNode } from 'react';
import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { formatEnumLabel } from '@/lib/format-label';

export type LoanProductFormValues = {
    id?: number;
    name?: string;
    code?: string;
    min_amount?: number;
    max_amount?: number;
    interest_rate?: string | number;
    interest_type?: string;
    term_min_days?: number;
    term_max_days?: number;
    repayment_frequency?: string;
    grace_period_days?: number | null;
    processing_fee?: number | null;
    description?: string | null;
    is_active?: boolean;
};

type LoanProductFormFieldsProps = {
    errors: Record<string, string | undefined>;
    product?: LoanProductFormValues;
    interestTypes: string[];
    frequencies: string[];
    mode: 'create' | 'edit';
};

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {title}
                </p>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

export function LoanProductFormFields({
    errors,
    product,
    interestTypes,
    frequencies,
    mode,
}: LoanProductFormFieldsProps) {
    return (
        <div className="space-y-8">
            <FormSection
                title="Product identity"
                description="A short code is used on reports and applications."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="name"
                        label="Product name"
                        error={errors.name}
                        required
                    >
                        <Input
                            id="name"
                            name="name"
                            defaultValue={product?.name ?? ''}
                            required
                            autoFocus={mode === 'create'}
                            placeholder="Business loan"
                            aria-invalid={!!errors.name}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="code"
                        label="Product code"
                        error={errors.code}
                        required
                        hint="Letters, numbers, dashes only"
                    >
                        <Input
                            id="code"
                            name="code"
                            defaultValue={product?.code ?? ''}
                            required
                            placeholder="BL-01"
                            aria-invalid={!!errors.code}
                            className="h-10 font-mono uppercase"
                        />
                    </FormField>
                </div>
                <FormField
                    id="description"
                    label="Description"
                    error={errors.description}
                    hint="Optional internal notes"
                >
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={product?.description ?? ''}
                        rows={2}
                        placeholder="Short-term working capital for traders"
                        aria-invalid={!!errors.description}
                    />
                </FormField>
            </FormSection>

            <FormSection
                title="Amounts & pricing"
                description="Amounts are in your organization currency (whole units)."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="min_amount"
                        label="Minimum amount"
                        error={errors.min_amount}
                        required
                    >
                        <Input
                            id="min_amount"
                            name="min_amount"
                            type="number"
                            min={1}
                            defaultValue={product?.min_amount ?? ''}
                            required
                            aria-invalid={!!errors.min_amount}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="max_amount"
                        label="Maximum amount"
                        error={errors.max_amount}
                        required
                    >
                        <Input
                            id="max_amount"
                            name="max_amount"
                            type="number"
                            min={1}
                            defaultValue={product?.max_amount ?? ''}
                            required
                            aria-invalid={!!errors.max_amount}
                            className="h-10"
                        />
                    </FormField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="interest_rate"
                        label="Interest rate (%)"
                        error={errors.interest_rate}
                        required
                    >
                        <Input
                            id="interest_rate"
                            name="interest_rate"
                            type="number"
                            step="0.01"
                            min={0}
                            max={100}
                            defaultValue={product?.interest_rate ?? ''}
                            required
                            aria-invalid={!!errors.interest_rate}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="interest_type"
                        label="Interest type"
                        error={errors.interest_type}
                        required
                    >
                        <NativeSelect
                            id="interest_type"
                            name="interest_type"
                            defaultValue={
                                product?.interest_type ?? interestTypes[0]
                            }
                            required
                            aria-invalid={!!errors.interest_type}
                        >
                            {interestTypes.map((type) => (
                                <option key={type} value={type}>
                                    {formatEnumLabel(type)}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="processing_fee"
                        label="Processing fee"
                        error={errors.processing_fee}
                        hint="Optional flat fee"
                    >
                        <Input
                            id="processing_fee"
                            name="processing_fee"
                            type="number"
                            min={0}
                            defaultValue={product?.processing_fee ?? ''}
                            aria-invalid={!!errors.processing_fee}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="grace_period_days"
                        label="Grace period (days)"
                        error={errors.grace_period_days}
                        hint="Days before first installment"
                    >
                        <Input
                            id="grace_period_days"
                            name="grace_period_days"
                            type="number"
                            min={0}
                            defaultValue={product?.grace_period_days ?? ''}
                            aria-invalid={!!errors.grace_period_days}
                            className="h-10"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection title="Terms & schedule">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="term_min_days"
                        label="Minimum term (days)"
                        error={errors.term_min_days}
                        required
                    >
                        <Input
                            id="term_min_days"
                            name="term_min_days"
                            type="number"
                            min={1}
                            defaultValue={product?.term_min_days ?? ''}
                            required
                            aria-invalid={!!errors.term_min_days}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="term_max_days"
                        label="Maximum term (days)"
                        error={errors.term_max_days}
                        required
                    >
                        <Input
                            id="term_max_days"
                            name="term_max_days"
                            type="number"
                            min={1}
                            defaultValue={product?.term_max_days ?? ''}
                            required
                            aria-invalid={!!errors.term_max_days}
                            className="h-10"
                        />
                    </FormField>
                </div>
                <FormField
                    id="repayment_frequency"
                    label="Repayment frequency"
                    error={errors.repayment_frequency}
                    required
                >
                    <NativeSelect
                        id="repayment_frequency"
                        name="repayment_frequency"
                        defaultValue={
                            product?.repayment_frequency ?? frequencies[0]
                        }
                        required
                        aria-invalid={!!errors.repayment_frequency}
                    >
                        {frequencies.map((frequency) => (
                            <option key={frequency} value={frequency}>
                                {formatEnumLabel(frequency)}
                            </option>
                        ))}
                    </NativeSelect>
                </FormField>
            </FormSection>

            {mode === 'create' ? (
                <input type="hidden" name="is_active" value="1" />
            ) : (
                <FormSection
                    title="Availability"
                    description="Inactive products cannot be used for new applications."
                >
                    <FormField
                        id="is_active"
                        label="Status"
                        error={errors.is_active}
                    >
                        <NativeSelect
                            id="is_active"
                            name="is_active"
                            defaultValue={
                                product?.is_active === false ? '0' : '1'
                            }
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </NativeSelect>
                    </FormField>
                </FormSection>
            )}
        </div>
    );
}

import { useMemo, useState } from 'react';
import { FormField } from '@/components/form-field';
import {
    LoanApplicationCollateralFields
    
} from '@/components/loan-applications/loan-application-collateral-fields';
import type {CollateralTypeOption} from '@/components/loan-applications/loan-application-collateral-fields';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { formatMoney } from '@/lib/format-money';

export type PortalProductOption = {
    id: number;
    name: string;
    code: string;
    min_amount: number;
    max_amount: number;
    term_min_days: number;
    term_max_days: number;
};

type Props = {
    errors: Record<string, string | undefined>;
    products: PortalProductOption[];
    collateralTypes: CollateralTypeOption[];
    currency: string;
    values?: {
        loan_product_id?: number | string;
        requested_amount?: number | string;
        term_days?: number | string;
        purpose?: string;
    };
};

export function PortalApplicationFormFields({
    errors,
    products,
    collateralTypes,
    currency,
    values,
}: Props) {
    const [productId, setProductId] = useState(
        String(values?.loan_product_id ?? ''),
    );

    const selectedProduct = useMemo(
        () => products.find((product) => String(product.id) === productId),
        [productId, products],
    );

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Loan product
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose the product that best fits what you need to
                        borrow.
                    </p>
                </div>
                <FormField
                    id="loan_product_id"
                    label="Product"
                    error={errors.loan_product_id}
                    required
                >
                    <NativeSelect
                        id="loan_product_id"
                        name="loan_product_id"
                        value={productId}
                        required
                        aria-invalid={!!errors.loan_product_id}
                        onChange={(event) => setProductId(event.target.value)}
                    >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} ({product.code})
                            </option>
                        ))}
                    </NativeSelect>
                </FormField>
                {selectedProduct && (
                    <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
                        <p className="font-medium">{selectedProduct.name}</p>
                        <p className="mt-1 text-muted-foreground">
                            Amount:{' '}
                            {formatMoney(selectedProduct.min_amount, currency)}{' '}
                            –{' '}
                            {formatMoney(selectedProduct.max_amount, currency)}
                        </p>
                        <p className="text-muted-foreground">
                            Term: {selectedProduct.term_min_days}–
                            {selectedProduct.term_max_days} days
                        </p>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Request details
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter the amount and term you are applying for.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        id="requested_amount"
                        label={`Amount (${currency})`}
                        error={errors.requested_amount}
                        required
                    >
                        <Input
                            id="requested_amount"
                            name="requested_amount"
                            type="number"
                            min={selectedProduct?.min_amount ?? 1}
                            max={selectedProduct?.max_amount}
                            defaultValue={values?.requested_amount ?? ''}
                            required
                            aria-invalid={!!errors.requested_amount}
                            placeholder={
                                selectedProduct
                                    ? `${selectedProduct.min_amount} – ${selectedProduct.max_amount}`
                                    : undefined
                            }
                        />
                    </FormField>
                    <FormField
                        id="term_days"
                        label="Term (days)"
                        error={errors.term_days}
                        required
                    >
                        <Input
                            id="term_days"
                            name="term_days"
                            type="number"
                            min={selectedProduct?.term_min_days ?? 1}
                            max={selectedProduct?.term_max_days}
                            defaultValue={values?.term_days ?? ''}
                            required
                            aria-invalid={!!errors.term_days}
                            placeholder={
                                selectedProduct
                                    ? `${selectedProduct.term_min_days} – ${selectedProduct.term_max_days}`
                                    : undefined
                            }
                        />
                    </FormField>
                </div>
                <FormField
                    id="purpose"
                    label="Purpose (optional)"
                    error={errors.purpose}
                >
                    <Textarea
                        id="purpose"
                        name="purpose"
                        rows={4}
                        defaultValue={values?.purpose ?? ''}
                        placeholder="Briefly describe how you plan to use the funds"
                        aria-invalid={!!errors.purpose}
                    />
                </FormField>
            </section>

            <LoanApplicationCollateralFields
                errors={errors}
                collateralTypes={collateralTypes}
                currency={currency}
            />
        </div>
    );
}

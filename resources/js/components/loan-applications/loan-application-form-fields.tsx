import { useMemo, useState } from 'react';
import {
    LoanApplicationCollateralFields,
    type CollateralTypeOption,
} from '@/components/loan-applications/loan-application-collateral-fields';
import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { formatMoney } from '@/lib/format-money';

type CustomerOption = {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
};

type ProductOption = {
    id: number;
    name: string;
    code: string;
    min_amount: number;
    max_amount: number;
    term_min_days: number;
    term_max_days: number;
};

type LoanApplicationFormFieldsProps = {
    errors: Record<string, string | undefined>;
    customers: CustomerOption[];
    products: ProductOption[];
    collateralTypes: CollateralTypeOption[];
    currency?: string;
    values?: {
        customer_id?: number | string;
        loan_product_id?: number | string;
        requested_amount?: number | string;
        term_days?: number | string;
        purpose?: string;
    };
};

export function LoanApplicationFormFields({
    errors,
    customers,
    products,
    collateralTypes,
    currency = 'UGX',
    values,
}: LoanApplicationFormFieldsProps) {
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
                        Borrower & product
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose an active customer and loan product for this
                        application.
                    </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <FormField
                        id="customer_id"
                        label="Customer"
                        error={errors.customer_id}
                        required
                    >
                        <NativeSelect
                            id="customer_id"
                            name="customer_id"
                            defaultValue={values?.customer_id ?? ''}
                            required
                            aria-invalid={!!errors.customer_id}
                        >
                            <option value="">Select customer</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.first_name} {customer.last_name} ·{' '}
                                    {customer.phone}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>
                    <FormField
                        id="loan_product_id"
                        label="Loan product"
                        error={errors.loan_product_id}
                        required
                    >
                        <NativeSelect
                            id="loan_product_id"
                            name="loan_product_id"
                            value={productId}
                            required
                            aria-invalid={!!errors.loan_product_id}
                            onChange={(event) =>
                                setProductId(event.target.value)
                            }
                        >
                            <option value="">Select product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ({product.code})
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>
                </div>
                {selectedProduct && (
                    <p className="text-sm text-muted-foreground">
                        Amount: {formatMoney(selectedProduct.min_amount, currency)}{' '}
                        – {formatMoney(selectedProduct.max_amount, currency)} ·
                        Term: {selectedProduct.term_min_days}–
                        {selectedProduct.term_max_days} days
                    </p>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Loan request
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Amount and term must fall within the selected product
                        limits.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="requested_amount"
                        label="Requested amount"
                        error={errors.requested_amount}
                        required
                        hint={
                            selectedProduct
                                ? `${formatMoney(selectedProduct.min_amount, currency)} – ${formatMoney(selectedProduct.max_amount, currency)}`
                                : undefined
                        }
                    >
                        <Input
                            id="requested_amount"
                            name="requested_amount"
                            type="number"
                            min={selectedProduct?.min_amount ?? 1}
                            max={selectedProduct?.max_amount}
                            defaultValue={values?.requested_amount ?? ''}
                            required
                            disabled={!selectedProduct}
                            autoFocus
                            aria-invalid={!!errors.requested_amount}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="term_days"
                        label="Term (days)"
                        error={errors.term_days}
                        required
                        hint={
                            selectedProduct
                                ? `${selectedProduct.term_min_days}–${selectedProduct.term_max_days} days`
                                : undefined
                        }
                    >
                        <Input
                            id="term_days"
                            name="term_days"
                            type="number"
                            min={selectedProduct?.term_min_days ?? 1}
                            max={selectedProduct?.term_max_days}
                            defaultValue={values?.term_days ?? ''}
                            required
                            disabled={!selectedProduct}
                            aria-invalid={!!errors.term_days}
                            className="h-10"
                        />
                    </FormField>
                </div>
                <FormField
                    id="purpose"
                    label="Purpose"
                    error={errors.purpose}
                    hint="Optional — e.g. inventory, school fees"
                >
                    <Textarea
                        id="purpose"
                        name="purpose"
                        defaultValue={values?.purpose ?? ''}
                        rows={3}
                        placeholder="Working capital for shop restock"
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

import { Form, Head } from '@inertiajs/react';
import { FormActions } from '@/components/form-actions';
import { FormPageShell } from '@/components/form-page-shell';
import {
    LoanProductFormFields,
    type LoanProductFormValues,
} from '@/components/loan-products/loan-product-form-fields';
import { index, update } from '@/routes/loan-products';

export default function LoanProductsEdit({
    product,
    interestTypes,
    frequencies,
}: {
    product: LoanProductFormValues & { id: number };
    interestTypes: string[];
    frequencies: string[];
}) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <FormPageShell
                backHref={index().url}
                backLabel="Back to products"
                title={`Edit ${product.name}`}
                description={`Update configuration for product code ${product.code}.`}
                cardTitle="Product configuration"
            >
                <Form
                    {...update.form(product.id)}
                    disableWhileProcessing
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <LoanProductFormFields
                                mode="edit"
                                product={product}
                                errors={errors}
                                interestTypes={interestTypes}
                                frequencies={frequencies}
                            />
                            <FormActions
                                processing={processing}
                                cancelHref={index().url}
                                submitLabel="Save changes"
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

LoanProductsEdit.layout = {
    breadcrumbs: [
        { title: 'Loan products', href: '/loan-products' },
        { title: 'Edit product', href: '/loan-products' },
    ],
};

import { Form, Head } from '@inertiajs/react';
import { FormActions } from '@/components/form-actions';
import { FormPageShell } from '@/components/form-page-shell';
import { LoanProductFormFields } from '@/components/loan-products/loan-product-form-fields';
import { create, index, store } from '@/routes/loan-products';

export default function LoanProductsCreate({
    interestTypes,
    frequencies,
}: {
    interestTypes: string[];
    frequencies: string[];
}) {
    return (
        <>
            <Head title="New loan product" />
            <FormPageShell
                backHref={index().url}
                backLabel="Back to products"
                title="New loan product"
                description="Define amount limits, interest, and repayment rules for a loan offering."
                cardTitle="Product configuration"
                cardDescription="Fields marked with * are required."
            >
                <Form {...store.form()} disableWhileProcessing className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <LoanProductFormFields
                                mode="create"
                                errors={errors}
                                interestTypes={interestTypes}
                                frequencies={frequencies}
                            />
                            <FormActions
                                processing={processing}
                                cancelHref={index().url}
                                submitLabel="Save product"
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

LoanProductsCreate.layout = {
    breadcrumbs: [
        { title: 'Loan products', href: '/loan-products' },
        { title: 'New product', href: create().url },
    ],
};

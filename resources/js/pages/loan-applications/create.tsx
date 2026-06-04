import { Form, Head, usePage } from '@inertiajs/react';
import { FormActions } from '@/components/form-actions';
import { FormPageShell } from '@/components/form-page-shell';
import { LoanApplicationFormFields } from '@/components/loan-applications/loan-application-form-fields';
import { create, index, store } from '@/routes/loan-applications';

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
};

export default function LoanApplicationsCreate({
    customers,
    products,
}: {
    customers: CustomerOption[];
    products: ProductOption[];
}) {
    const { auth } = usePage<{ auth: { organization?: { currency: string } } }>()
        .props;
    const currency = auth.organization?.currency ?? 'UGX';

    return (
        <>
            <Head title="New application" />
            <FormPageShell
                backHref={index().url}
                backLabel="Back to applications"
                title="New loan application"
                description="Start a draft application. You can submit it for review after saving."
                cardTitle="Application details"
                cardDescription="Fields marked with * are required."
            >
                <Form {...store.form()} disableWhileProcessing className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <LoanApplicationFormFields
                                errors={errors}
                                customers={customers}
                                products={products}
                                currency={currency}
                            />
                            <FormActions
                                processing={processing}
                                cancelHref={index().url}
                                submitLabel="Create application"
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

LoanApplicationsCreate.layout = {
    breadcrumbs: [
        { title: 'Applications', href: '/loan-applications' },
        { title: 'New', href: create().url },
    ],
};

import { Form, Head } from '@inertiajs/react';
import { CustomerFormFields } from '@/components/customers/customer-form-fields';
import { FormActions } from '@/components/form-actions';
import { FormPageShell } from '@/components/form-page-shell';
import { index, store } from '@/routes/customers';

type SelectOption = {
    value: string;
    label: string;
};

export default function CustomersCreate({
    genders,
    idTypes,
    employmentStatuses,
    notificationChannels,
}: {
    genders: SelectOption[];
    idTypes: SelectOption[];
    employmentStatuses: SelectOption[];
    notificationChannels: SelectOption[];
}) {
    return (
        <>
            <Head title="Add customer" />
            <FormPageShell
                backHref={index().url}
                backLabel="Back to customers"
                title="Add customer"
                description="Register a new borrower with KYC details. A reference number is assigned when you save."
                cardTitle="Customer profile & KYC"
                cardDescription="Fields marked with * are required."
            >
                <Form
                    {...store.form()}
                    disableWhileProcessing
                    encType="multipart/form-data"
                    forceFormData
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <CustomerFormFields
                                mode="create"
                                errors={errors}
                                genders={genders}
                                idTypes={idTypes}
                                employmentStatuses={employmentStatuses}
                                notificationChannels={notificationChannels}
                            />
                            <FormActions
                                processing={processing}
                                cancelHref={index().url}
                                submitLabel="Save customer"
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

CustomersCreate.layout = {
    breadcrumbs: [
        { title: 'Customers', href: '/customers' },
        { title: 'Add customer', href: '/customers/create' },
    ],
};

import { Form, Head } from '@inertiajs/react';
import { CustomerFormFields } from '@/components/customers/customer-form-fields';
import type { CustomerFormValues } from '@/components/customers/customer-form-fields';
import { FormActions } from '@/components/form-actions';
import { FormPageShell } from '@/components/form-page-shell';
import { show, update } from '@/routes/customers';

type StatusOption = {
    value: string;
    label: string;
};

export default function CustomersEdit({
    customer,
    statuses,
    genders,
    idTypes,
    employmentStatuses,
    notificationChannels,
}: {
    customer: CustomerFormValues & { id: number };
    statuses: StatusOption[];
    genders: StatusOption[];
    idTypes: StatusOption[];
    employmentStatuses: StatusOption[];
    notificationChannels: StatusOption[];
}) {
    return (
        <>
            <Head title="Edit customer" />
            <FormPageShell
                backHref={show(customer.id).url}
                backLabel="Back to profile"
                title="Edit customer"
                description={`Update details for ${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim()}
                cardTitle="Customer profile"
                cardDescription="Changes are recorded in the audit log."
            >
                <Form
                    {...update.form(customer.id)}
                    disableWhileProcessing
                    encType="multipart/form-data"
                    forceFormData
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <CustomerFormFields
                                mode="edit"
                                customer={customer}
                                statuses={statuses}
                                genders={genders}
                                idTypes={idTypes}
                                employmentStatuses={employmentStatuses}
                                notificationChannels={notificationChannels}
                                errors={errors}
                            />
                            <FormActions
                                processing={processing}
                                cancelHref={show(customer.id).url}
                                submitLabel="Save changes"
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

CustomersEdit.layout = {
    breadcrumbs: [
        { title: 'Customers', href: '/customers' },
        { title: 'Edit customer', href: '/customers' },
    ],
};

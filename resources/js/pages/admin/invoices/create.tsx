import { Form, Head } from '@inertiajs/react';
import { FormActions } from '@/components/form-actions';
import { FormField } from '@/components/form-field';
import { FormPageShell } from '@/components/form-page-shell';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { create, index, store } from '@/routes/admin/invoices';

type Org = { id: number; name: string };

export default function AdminInvoiceCreate({
    organizations,
}: {
    organizations: Org[];
}) {
    return (
        <>
            <Head title="Create invoice" />
            <FormPageShell
                backHref={index().url}
                backLabel="Back to invoices"
                title="Create invoice"
                description="Issue a manual invoice to a tenant organization."
                cardTitle="Invoice details"
                cardDescription="All fields marked with * are required."
            >
                <Form {...store.form()} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="organization_id"
                                label="Organization"
                                error={errors.organization_id}
                                required
                            >
                                <NativeSelect
                                    id="organization_id"
                                    name="organization_id"
                                    required
                                    aria-invalid={!!errors.organization_id}
                                >
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id}>
                                            {org.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormField>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id="amount"
                                    label="Amount (UGX)"
                                    error={errors.amount}
                                    required
                                >
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min={1}
                                        required
                                        className="h-10"
                                        aria-invalid={!!errors.amount}
                                    />
                                </FormField>
                                <FormField
                                    id="due_at"
                                    label="Due date"
                                    error={errors.due_at}
                                >
                                    <Input
                                        id="due_at"
                                        name="due_at"
                                        type="date"
                                        className="h-10"
                                        aria-invalid={!!errors.due_at}
                                    />
                                </FormField>
                            </div>
                            <FormField
                                id="description"
                                label="Description"
                                error={errors.description}
                            >
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Manual invoice"
                                    aria-invalid={!!errors.description}
                                />
                            </FormField>
                            <FormActions
                                processing={processing}
                                cancelHref={index().url}
                                submitLabel="Create invoice"
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

AdminInvoiceCreate.layout = {
    breadcrumbs: [
        { title: 'Invoices', href: '/admin/invoices' },
        { title: 'Create', href: create().url },
    ],
};

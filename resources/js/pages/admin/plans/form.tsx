import { Form, Head } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { FormActions } from '@/components/form-actions';
import { FormField } from '@/components/form-field';
import { FormPageShell } from '@/components/form-page-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { formatMoney } from '@/lib/format-money';
import {
    index as plansIndex,
    store,
    update,
} from '@/routes/admin/plans';

type PlanForm = {
    id?: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    currency: string;
    billing_interval: string;
    trial_days: number;
    max_users: number | null;
    max_customers: number | null;
    max_active_loans: number | null;
    features: string[];
    is_active: boolean;
    sort_order: number;
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4 border-b border-border pb-6 last:border-b-0 last:pb-0">
            <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {children}
        </section>
    );
}

export default function AdminPlanForm({
    plan,
    billingIntervals,
}: {
    plan: PlanForm | null;
    billingIntervals: string[];
}) {
    const isEdit = plan?.id != null;
    const [name, setName] = useState(plan?.name ?? '');
    const [slug, setSlug] = useState(plan?.slug ?? '');
    const [slugTouched, setSlugTouched] = useState(isEdit);
    const [price, setPrice] = useState(String(plan?.price ?? 0));
    const [currency, setCurrency] = useState(
        (plan?.currency ?? 'UGX').toUpperCase(),
    );
    const [billingInterval, setBillingInterval] = useState(
        plan?.billing_interval ?? 'monthly',
    );

    const priceNumber = Number.parseInt(price, 10);
    const pricePreview =
        Number.isFinite(priceNumber) && priceNumber >= 0
            ? formatMoney(priceNumber, currency || 'UGX')
            : null;

    return (
        <>
            <Head title={isEdit ? `Edit ${plan.name}` : 'New plan'} />
            <FormPageShell
                backHref={plansIndex().url}
                backLabel="Back to plans"
                title={isEdit ? `Edit ${plan.name}` : 'New plan'}
                description={
                    isEdit
                        ? 'Update pricing, limits, and visibility for this subscription tier.'
                        : 'Define a subscription tier for tenant organizations.'
                }
                cardTitle={isEdit ? 'Plan details' : 'Create plan'}
                cardDescription="Leave limit fields empty for unlimited. Features appear on the public pricing page."
                maxWidth="3xl"
            >
                <Form
                    {...(isEdit ? update.form(plan.id) : store.form())}
                    disableWhileProcessing
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <Section
                                title="Identity"
                                description="How this plan is named and referenced across the platform."
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        id="name"
                                        label="Name"
                                        error={errors.name}
                                        required
                                    >
                                        <Input
                                            id="name"
                                            name="name"
                                            value={name}
                                            onChange={(event) => {
                                                const next = event.target.value;
                                                setName(next);

                                                if (!slugTouched) {
                                                    setSlug(slugify(next));
                                                }
                                            }}
                                            required
                                            className="h-10"
                                            placeholder="Professional"
                                            aria-invalid={!!errors.name}
                                        />
                                    </FormField>
                                    <FormField
                                        id="slug"
                                        label="Slug"
                                        error={errors.slug}
                                        required
                                        hint="URL-safe identifier used in pricing and billing."
                                    >
                                        <Input
                                            id="slug"
                                            name="slug"
                                            value={slug}
                                            onChange={(event) => {
                                                setSlugTouched(true);
                                                setSlug(
                                                    slugify(event.target.value),
                                                );
                                            }}
                                            required
                                            className="h-10 font-mono text-sm"
                                            placeholder="professional"
                                            aria-invalid={!!errors.slug}
                                        />
                                    </FormField>
                                </div>
                                <FormField
                                    id="description"
                                    label="Description"
                                    error={errors.description}
                                    hint="Short summary shown on the welcome pricing section."
                                >
                                    <Textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        defaultValue={plan?.description ?? ''}
                                        placeholder="For growing lenders who need team access and reporting."
                                        aria-invalid={!!errors.description}
                                    />
                                </FormField>
                            </Section>

                            <Section
                                title="Pricing"
                                description="What tenants are billed and how long the trial lasts."
                            >
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <FormField
                                        id="price"
                                        label="Price"
                                        error={errors.price}
                                        required
                                        hint="Whole currency units (not cents)."
                                    >
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={price}
                                            onChange={(event) =>
                                                setPrice(event.target.value)
                                            }
                                            required
                                            className="h-10 tabular-nums"
                                            aria-invalid={!!errors.price}
                                        />
                                    </FormField>
                                    <FormField
                                        id="currency"
                                        label="Currency"
                                        error={errors.currency}
                                        required
                                    >
                                        <Input
                                            id="currency"
                                            name="currency"
                                            value={currency}
                                            onChange={(event) =>
                                                setCurrency(
                                                    event.target.value
                                                        .toUpperCase()
                                                        .slice(0, 3),
                                                )
                                            }
                                            maxLength={3}
                                            required
                                            className="h-10 uppercase"
                                            aria-invalid={!!errors.currency}
                                        />
                                    </FormField>
                                    <FormField
                                        id="billing_interval"
                                        label="Billing interval"
                                        error={errors.billing_interval}
                                        required
                                    >
                                        <NativeSelect
                                            id="billing_interval"
                                            name="billing_interval"
                                            value={billingInterval}
                                            onChange={(event) =>
                                                setBillingInterval(
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            aria-invalid={
                                                !!errors.billing_interval
                                            }
                                            options={billingIntervals.map(
                                                (interval) => ({
                                                    value: interval,
                                                    label:
                                                        interval
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                        interval.slice(1),
                                                }),
                                            )}
                                        />
                                    </FormField>
                                </div>
                                {pricePreview && (
                                    <p className="border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                        Preview:{' '}
                                        <span className="font-medium text-foreground tabular-nums">
                                            {pricePreview}
                                        </span>
                                        {` / ${billingInterval}`}
                                    </p>
                                )}
                                <FormField
                                    id="trial_days"
                                    label="Trial days"
                                    error={errors.trial_days}
                                    required
                                    hint="Days before billing starts for new subscriptions."
                                    className="max-w-xs"
                                >
                                    <Input
                                        id="trial_days"
                                        name="trial_days"
                                        type="number"
                                        min={0}
                                        defaultValue={plan?.trial_days ?? 14}
                                        required
                                        className="h-10"
                                        aria-invalid={!!errors.trial_days}
                                    />
                                </FormField>
                            </Section>

                            <Section
                                title="Usage limits"
                                description="Leave blank for unlimited. Applies to each organization on this plan."
                            >
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <FormField
                                        id="max_users"
                                        label="Max users"
                                        error={errors.max_users}
                                    >
                                        <Input
                                            id="max_users"
                                            name="max_users"
                                            type="number"
                                            min={1}
                                            defaultValue={
                                                plan?.max_users ?? ''
                                            }
                                            placeholder="Unlimited"
                                            className="h-10"
                                            aria-invalid={!!errors.max_users}
                                        />
                                    </FormField>
                                    <FormField
                                        id="max_customers"
                                        label="Max customers"
                                        error={errors.max_customers}
                                    >
                                        <Input
                                            id="max_customers"
                                            name="max_customers"
                                            type="number"
                                            min={1}
                                            defaultValue={
                                                plan?.max_customers ?? ''
                                            }
                                            placeholder="Unlimited"
                                            className="h-10"
                                            aria-invalid={
                                                !!errors.max_customers
                                            }
                                        />
                                    </FormField>
                                    <FormField
                                        id="max_active_loans"
                                        label="Max active loans"
                                        error={errors.max_active_loans}
                                    >
                                        <Input
                                            id="max_active_loans"
                                            name="max_active_loans"
                                            type="number"
                                            min={1}
                                            defaultValue={
                                                plan?.max_active_loans ?? ''
                                            }
                                            placeholder="Unlimited"
                                            className="h-10"
                                            aria-invalid={
                                                !!errors.max_active_loans
                                            }
                                        />
                                    </FormField>
                                </div>
                            </Section>

                            <Section
                                title="Marketing features"
                                description="Bullet points shown on the public homepage pricing cards."
                            >
                                <FormField
                                    id="features"
                                    label="Features"
                                    error={
                                        errors.features ?? errors['features.0']
                                    }
                                    hint="One feature per line (commas also work)."
                                >
                                    <Textarea
                                        id="features"
                                        name="features"
                                        rows={5}
                                        defaultValue={(
                                            plan?.features ?? []
                                        ).join('\n')}
                                        placeholder={
                                            'Team invitations\nPDF loan statements\nSMS repayment reminders'
                                        }
                                        aria-invalid={!!errors.features}
                                    />
                                </FormField>
                            </Section>

                            <Section
                                title="Visibility"
                                description="Control whether this plan can be selected by new organizations."
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 border border-border p-4">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            name="is_active"
                                            value="1"
                                            defaultChecked={
                                                plan?.is_active ?? true
                                            }
                                            className="mt-1 size-4 shrink-0 border-input accent-foreground"
                                        />
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="is_active"
                                                className="text-sm font-medium"
                                            >
                                                Active plan
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Inactive plans stay assigned to
                                                existing subscribers but are
                                                hidden from new sign-ups.
                                            </p>
                                        </div>
                                    </div>
                                    <FormField
                                        id="sort_order"
                                        label="Sort order"
                                        error={errors.sort_order}
                                        hint="Lower numbers appear first on pricing."
                                    >
                                        <Input
                                            id="sort_order"
                                            name="sort_order"
                                            type="number"
                                            min={0}
                                            defaultValue={
                                                plan?.sort_order ?? 0
                                            }
                                            className="h-10"
                                            aria-invalid={!!errors.sort_order}
                                        />
                                    </FormField>
                                </div>
                            </Section>

                            <FormActions
                                processing={processing}
                                cancelHref={plansIndex().url}
                                submitLabel={
                                    isEdit ? 'Save changes' : 'Create plan'
                                }
                            />
                        </>
                    )}
                </Form>
            </FormPageShell>
        </>
    );
}

AdminPlanForm.layout = {
    breadcrumbs: [
        { title: 'Plans', href: '/admin/plans' },
        { title: 'Plan', href: '/admin/plans' },
    ],
};

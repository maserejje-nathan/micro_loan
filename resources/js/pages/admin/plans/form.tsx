import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function AdminPlanForm({
    plan,
    billingIntervals,
}: {
    plan: PlanForm | null;
    billingIntervals: string[];
}) {
    const isEdit = plan?.id != null;
    const action = isEdit ? `/admin/plans/${plan.id}` : '/admin/plans';
    const method = isEdit ? 'put' : 'post';

    return (
        <>
            <Head title={isEdit ? 'Edit plan' : 'New plan'} />
            <div className="w-full space-y-4 p-4">
                <h1 className="text-2xl font-semibold">
                    {isEdit ? 'Edit plan' : 'New plan'}
                </h1>
                <Form action={action} method={method} className="space-y-4">
                    {({ processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={plan?.name}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={plan?.slug}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    defaultValue={plan?.description ?? ''}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">
                                        Price (minor units)
                                    </Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        defaultValue={plan?.price ?? 0}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        name="currency"
                                        defaultValue={plan?.currency ?? 'UGX'}
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="billing_interval">
                                        Billing interval
                                    </Label>
                                    <select
                                        id="billing_interval"
                                        name="billing_interval"
                                        defaultValue={
                                            plan?.billing_interval ?? 'monthly'
                                        }
                                        className="h-9 rounded-md border px-3 text-sm"
                                    >
                                        {billingIntervals.map((i) => (
                                            <option key={i} value={i}>
                                                {i}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="trial_days">
                                        Trial days
                                    </Label>
                                    <Input
                                        id="trial_days"
                                        name="trial_days"
                                        type="number"
                                        defaultValue={plan?.trial_days ?? 14}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="max_users">Max users</Label>
                                    <Input
                                        id="max_users"
                                        name="max_users"
                                        type="number"
                                        defaultValue={plan?.max_users ?? ''}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_customers">
                                        Max customers
                                    </Label>
                                    <Input
                                        id="max_customers"
                                        name="max_customers"
                                        type="number"
                                        defaultValue={plan?.max_customers ?? ''}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_active_loans">
                                        Max active loans
                                    </Label>
                                    <Input
                                        id="max_active_loans"
                                        name="max_active_loans"
                                        type="number"
                                        defaultValue={
                                            plan?.max_active_loans ?? ''
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="features">
                                    Features (comma-separated)
                                </Label>
                                <Input
                                    id="features"
                                    name="features"
                                    defaultValue={(plan?.features ?? []).join(
                                        ', ',
                                    )}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={plan?.is_active ?? true}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Sort order</Label>
                                <Input
                                    id="sort_order"
                                    name="sort_order"
                                    type="number"
                                    defaultValue={plan?.sort_order ?? 0}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Save
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/plans">Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

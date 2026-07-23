import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Info } from 'lucide-react';
import { FormActions } from '@/components/form-actions';
import { PortalApplicationFormFields } from '@/components/portal/portal-application-form-fields';
import { PortalPage } from '@/components/portal/portal-page';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatMoney } from '@/lib/format-money';
import {
    index as applicationsIndex,
    store,
} from '@/routes/portal/applications';

type Product = {
    id: number;
    name: string;
    code: string;
    min_amount: number;
    max_amount: number;
    term_min_days: number;
    term_max_days: number;
};

type CollateralTypeOption = {
    value: string;
    label: string;
};

export default function PortalApplicationCreate({
    products,
    collateralTypes,
    currency,
    formDefaults,
}: {
    products: Product[];
    collateralTypes: CollateralTypeOption[];
    currency: string;
    formDefaults?: {
        collaterals?: {
            type?: string;
            description?: string;
            estimated_value?: number | string;
            identifier?: string;
        }[];
    };
}) {
    return (
        <>
            <Head title="New application" />
            <PortalPage>
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="mb-2 -ml-2"
                    >
                        <Link href={applicationsIndex().url}>
                            <ArrowLeft className="mr-2 size-4" />
                            Applications
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        New loan application
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Save as a draft now and submit when you are ready for
                        your lender to review.
                    </p>
                </div>

                <Card variant="secondary" className="border-primary/20">
                    <CardContent className="flex gap-3 p-4">
                        <Info className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div className="text-sm">
                            <p className="font-medium">How it works</p>
                            <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
                                <li>
                                    Choose a loan product and enter your
                                    request.
                                </li>
                                <li>Save the application as a draft.</li>
                                <li>
                                    Open the application and submit it for
                                    review when you are ready.
                                </li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>

                {products.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            No loan products are available for online
                            applications right now. Please contact your lender.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader className="border-b">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="size-5 text-primary" />
                                    <div>
                                        <CardTitle className="text-base">
                                            Application details
                                        </CardTitle>
                                        <CardDescription>
                                            All fields marked with * are
                                            required
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Form
                                    {...store.form()}
                                    disableWhileProcessing
                                    className="space-y-6"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <PortalApplicationFormFields
                                                errors={errors}
                                                products={products}
                                                collateralTypes={
                                                    collateralTypes
                                                }
                                                currency={currency}
                                                values={formDefaults}
                                            />
                                            <FormActions
                                                processing={processing}
                                                cancelHref={
                                                    applicationsIndex().url
                                                }
                                                submitLabel="Save as draft"
                                            />
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        <Card className="h-fit">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base">
                                    Available products
                                </CardTitle>
                                <CardDescription>
                                    {products.length} product
                                    {products.length === 1 ? '' : 's'} to choose
                                    from
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y p-0">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="px-4 py-3 text-sm"
                                    >
                                        <p className="font-medium">
                                            {product.name}
                                        </p>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {product.code}
                                        </p>
                                        <p className="mt-1 text-muted-foreground">
                                            {formatMoney(
                                                product.min_amount,
                                                currency,
                                            )}{' '}
                                            –{' '}
                                            {formatMoney(
                                                product.max_amount,
                                                currency,
                                            )}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {product.term_min_days}–
                                            {product.term_max_days} days
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </PortalPage>
        </>
    );
}

PortalApplicationCreate.layout = {
    breadcrumbs: [
        { title: 'Overview', href: '/portal' },
        { title: 'Applications', href: '/portal/applications' },
        { title: 'New', href: '/portal/applications/create/new' },
    ],
};

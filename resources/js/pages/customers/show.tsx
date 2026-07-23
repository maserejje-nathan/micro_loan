import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    ExternalLink,
    FileText,
    Globe,
    Mail,
    Phone,
    Shield,
    Users,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CustomerAvatar } from '@/components/customer-avatar';
import type { CustomerFormValues } from '@/components/customers/customer-form-fields';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import { FormField } from '@/components/form-field';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import { disable, enable } from '@/routes/customers/portal';
import type { Auth } from '@/types';
import type { Paginated } from '@/types/pagination';

type LoanApplicationSummary = {
    id: number;
    reference_number: string;
    product_name: string;
    requested_amount: number;
    status: string;
};

type LoanSummary = {
    id: number;
    reference_number: string;
    principal: number;
    outstanding_balance: number;
    status: string;
};

type PortalInfo = {
    organizationEnabled: boolean;
    customerEnabled: boolean;
    portalEnabledAt: string | null;
    portalLastLoginAt: string | null;
    loginUrl: string | null;
};

function KycSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {title}
            </p>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </dl>
        </div>
    );
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    if (!value) {
        return null;
    }

    return (
        <div className="rounded-none border border-border bg-muted px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{value}</dd>
        </div>
    );
}

export default function CustomersShow({
    customer,
    loanApplications,
    loans,
    loanStats,
    portal,
}: {
    customer: CustomerFormValues;
    loanApplications: Paginated<LoanApplicationSummary>;
    loans: Paginated<LoanSummary>;
    loanStats: {
        applications_total: number;
        active_loans: number;
        total_outstanding: number;
    };
    portal: PortalInfo;
}) {
    const page = usePage<{
        auth: Auth;
        flash: { portal_password?: string };
    }>();
    const currency = page.props.auth.organization?.currency ?? 'UGX';
    const generatedPassword = page.props.flash?.portal_password;

    const fullAddress = [customer.address, customer.city, customer.district]
        .filter(Boolean)
        .join(', ');

    const hasKyc =
        customer.date_of_birth ||
        customer.national_id ||
        customer.employment_status ||
        customer.email ||
        fullAddress;

    return (
        <>
            <Head title={String(customer.reference_number)} />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <CustomerAvatar
                                name={`${customer.first_name} ${customer.last_name}`}
                                photoUrl={customer.photo_url}
                                size="lg"
                            />
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        {customer.first_name}{' '}
                                        {customer.last_name}
                                    </h1>
                                    {customer.status && (
                                        <EntityStatusBadge
                                            status={customer.status}
                                            type="customer"
                                        />
                                    )}
                                </div>
                                <p className="font-mono text-sm text-muted-foreground">
                                    {customer.reference_number}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone className="size-3.5" />
                                        {customer.phone}
                                    </span>
                                    {customer.email && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Mail className="size-3.5" />
                                            {customer.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" asChild className="shrink-0">
                            <Link href={`/customers/${customer.id}/edit`}>
                                Edit profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Applications
                                </p>
                                <p className="text-2xl font-semibold">
                                    {loanStats.applications_total}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Wallet className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Active loans
                                </p>
                                <p className="text-2xl font-semibold">
                                    {loanStats.active_loans}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Briefcase className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Outstanding
                                </p>
                                <p className="text-2xl font-semibold">
                                    {formatMoney(
                                        loanStats.total_outstanding,
                                        currency,
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-2">
                            <Globe className="size-5 text-primary" />
                            <div>
                                <CardTitle>Client portal</CardTitle>
                                <CardDescription>
                                    Self-service access for this borrower
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {!portal.organizationEnabled ? (
                            <p className="text-sm text-muted-foreground">
                                Enable the client portal in{' '}
                                <Link
                                    href="/settings/portal"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    settings
                                </Link>{' '}
                                before granting customer access.
                            </p>
                        ) : portal.customerEnabled ? (
                            <>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {portal.portalEnabledAt && (
                                        <p className="text-muted-foreground">
                                            Enabled{' '}
                                            {new Date(
                                                portal.portalEnabledAt,
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                    {portal.portalLastLoginAt && (
                                        <p className="text-muted-foreground">
                                            Last sign-in{' '}
                                            {new Date(
                                                portal.portalLastLoginAt,
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                {generatedPassword && (
                                    <div className="rounded-none border border-amber-500/40 bg-amber-500/10 p-4">
                                        <p className="text-sm font-medium">
                                            Temporary password (share securely)
                                        </p>
                                        <p className="mt-1 font-mono text-lg">
                                            {generatedPassword}
                                        </p>
                                    </div>
                                )}
                                {portal.loginUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={portal.loginUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink className="mr-2 size-4" />
                                            Open portal sign-in
                                        </a>
                                    </Button>
                                )}
                                <Form
                                    {...disable.form(customer.id)}
                                    disableWhileProcessing
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            size="sm"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Disable portal access
                                        </Button>
                                    )}
                                </Form>
                            </>
                        ) : (
                            <Form
                                {...enable.form(customer.id)}
                                disableWhileProcessing
                                className="flex max-w-md flex-col gap-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <FormField
                                            id="portal_password"
                                            label="Password (optional)"
                                            error={errors.password}
                                            hint="Leave blank to generate a secure password automatically."
                                        >
                                            <PasswordInput
                                                id="portal_password"
                                                name="password"
                                                autoComplete="new-password"
                                                className="h-10"
                                                aria-invalid={!!errors.password}
                                            />
                                        </FormField>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Enable portal access
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-primary" />
                            <div>
                                <CardTitle>KYC profile</CardTitle>
                                <CardDescription>
                                    Identity, contact, employment, and next of
                                    kin
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {!hasKyc ? (
                            <EmptyState
                                icon={Users}
                                title="No KYC details yet"
                                description="Add identity and employment information for this borrower."
                                action={
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={`/customers/${customer.id}/edit`}
                                        >
                                            Add KYC information
                                        </Link>
                                    </Button>
                                }
                            />
                        ) : (
                            <>
                                <KycSection title="Personal & identity">
                                    <DetailItem
                                        label="Date of birth"
                                        value={
                                            customer.date_of_birth ?? undefined
                                        }
                                    />
                                    <DetailItem
                                        label="Gender"
                                        value={
                                            customer.gender
                                                ? formatEnumLabel(
                                                      customer.gender,
                                                  )
                                                : undefined
                                        }
                                    />
                                    <DetailItem
                                        label="Nationality"
                                        value={
                                            customer.nationality ?? undefined
                                        }
                                    />
                                    <DetailItem
                                        label="ID type"
                                        value={
                                            customer.id_type
                                                ? formatEnumLabel(
                                                      customer.id_type,
                                                  )
                                                : undefined
                                        }
                                    />
                                    <DetailItem
                                        label="ID number"
                                        value={
                                            customer.national_id ?? undefined
                                        }
                                    />
                                    <DetailItem
                                        label="ID expiry"
                                        value={
                                            customer.id_expiry_date ?? undefined
                                        }
                                    />
                                </KycSection>

                                {(customer.id_front_url ||
                                    customer.id_back_url) && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            ID document images
                                        </p>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {customer.id_front_url && (
                                                <a
                                                    href={customer.id_front_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block overflow-hidden rounded-none border border-border bg-muted"
                                                >
                                                    <img
                                                        src={
                                                            customer.id_front_url
                                                        }
                                                        alt="ID front"
                                                        className="aspect-[3/2] w-full object-contain"
                                                    />
                                                    <p className="border-t px-3 py-2 text-center text-xs text-muted-foreground">
                                                        Front — open full size
                                                    </p>
                                                </a>
                                            )}
                                            {customer.id_back_url && (
                                                <a
                                                    href={customer.id_back_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block overflow-hidden rounded-none border border-border bg-muted"
                                                >
                                                    <img
                                                        src={
                                                            customer.id_back_url
                                                        }
                                                        alt="ID back"
                                                        className="aspect-[3/2] w-full object-contain"
                                                    />
                                                    <p className="border-t px-3 py-2 text-center text-xs text-muted-foreground">
                                                        Back — open full size
                                                    </p>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(fullAddress || customer.district) && (
                                    <KycSection title="Location">
                                        <DetailItem
                                            label="Address"
                                            value={fullAddress || undefined}
                                        />
                                    </KycSection>
                                )}

                                {(customer.employment_status ||
                                    customer.occupation ||
                                    customer.monthly_income) && (
                                    <KycSection title="Employment & income">
                                        <DetailItem
                                            label="Employment"
                                            value={
                                                customer.employment_status
                                                    ? formatEnumLabel(
                                                          customer.employment_status,
                                                      )
                                                    : undefined
                                            }
                                        />
                                        <DetailItem
                                            label="Occupation"
                                            value={
                                                customer.occupation ?? undefined
                                            }
                                        />
                                        <DetailItem
                                            label="Employer"
                                            value={
                                                customer.employer_name ??
                                                undefined
                                            }
                                        />
                                        <DetailItem
                                            label="Monthly income"
                                            value={
                                                customer.monthly_income != null
                                                    ? formatMoney(
                                                          customer.monthly_income,
                                                          currency,
                                                      )
                                                    : undefined
                                            }
                                        />
                                    </KycSection>
                                )}

                                {customer.next_of_kin_name && (
                                    <KycSection title="Next of kin">
                                        <DetailItem
                                            label="Name"
                                            value={customer.next_of_kin_name}
                                        />
                                        <DetailItem
                                            label="Phone"
                                            value={
                                                customer.next_of_kin_phone ??
                                                undefined
                                            }
                                        />
                                        <DetailItem
                                            label="Relationship"
                                            value={
                                                customer.next_of_kin_relationship ??
                                                undefined
                                            }
                                        />
                                    </KycSection>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Loan applications</CardTitle>
                            <CardDescription>
                                Requests submitted by this customer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loanApplications.data.length === 0 ? (
                                <p className="p-6 text-sm text-muted-foreground">
                                    No applications yet.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">
                                                Amount
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loanApplications.data.map(
                                            (application) => (
                                                <TableRow key={application.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/loan-applications/${application.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {
                                                                application.reference_number
                                                            }
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {
                                                            application.product_name
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatMoney(
                                                            application.requested_amount,
                                                            currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <EntityStatusBadge
                                                            status={
                                                                application.status
                                                            }
                                                            type="loan_application"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                            <DataTablePagination paginator={loanApplications} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Loans</CardTitle>
                            <CardDescription>
                                Disbursed loans and balances
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loans.data.length === 0 ? (
                                <p className="p-6 text-sm text-muted-foreground">
                                    No loans yet.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead className="text-right">
                                                Principal
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Outstanding
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loans.data.map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell>
                                                    <Link
                                                        href={`/loans/${loan.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {loan.reference_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {formatMoney(
                                                        loan.principal,
                                                        currency,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatMoney(
                                                        loan.outstanding_balance,
                                                        currency,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <EntityStatusBadge
                                                        status={loan.status}
                                                        type="loan"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            <DataTablePagination paginator={loans} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

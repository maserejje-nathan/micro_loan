import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, Clock, Plus } from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/lib/format-money';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type Application = {
    id: number;
    reference_number: string;
    customer_id: number;
    customer_name: string;
    product_name: string;
    product_code: string;
    requested_amount: number;
    approved_amount: number | null;
    term_days: number;
    status: string;
    created_at: string;
};

function formatDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function LoanApplicationsIndex({
    applications,
    currency,
    stats,
}: {
    applications: Paginated<Application>;
    currency: string;
    stats: { total: number; pending: number; approved: number };
}) {
    const total = paginatorTotal(applications);

    return (
        <>
            <Head title="Loan applications" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Loan applications
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track requests from submission through approval
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/loan-applications/create">
                            <Plus className="mr-2 size-4" />
                            New application
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Total applications"
                        value={String(stats.total)}
                        description="All time in your organization"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Awaiting decision"
                        value={String(stats.pending)}
                        description="Submitted or under review"
                        icon={Clock}
                        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                        title="Approved"
                        value={String(stats.approved)}
                        description="Ready for disbursement"
                        icon={CheckCircle2}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>All applications</CardTitle>
                        <CardDescription>
                            {total} {total === 1 ? 'application' : 'applications'}{' '}
                            · amounts in {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {applications.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={ClipboardList}
                                    title="No applications yet"
                                    description="Create an application to start the lending workflow for a customer."
                                    action={
                                        <Button asChild>
                                            <Link href="/loan-applications/create">
                                                New application
                                            </Link>
                                        </Button>
                                    }
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Product
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell text-right">
                                            Term
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                        <TableHead className="hidden sm:table-cell">
                                            Submitted
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.data.map((application) => (
                                        <TableRow key={application.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/loan-applications/${application.id}`}
                                                    className="font-mono text-sm font-medium hover:underline"
                                                >
                                                    {application.reference_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/customers/${application.customer_id}`}
                                                    className="hover:underline"
                                                >
                                                    {application.customer_name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <p className="text-sm">
                                                    {application.product_name}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {application.product_code}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                                                {application.term_days} days
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <p className="font-medium">
                                                    {formatMoney(
                                                        application.requested_amount,
                                                        currency,
                                                    )}
                                                </p>
                                                {application.approved_amount !=
                                                    null &&
                                                    application.approved_amount !==
                                                        application.requested_amount && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Approved{' '}
                                                            {formatMoney(
                                                                application.approved_amount,
                                                                currency,
                                                            )}
                                                        </p>
                                                    )}
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                                                {formatDate(application.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <EntityStatusBadge
                                                    status={application.status}
                                                    type="loan_application"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/loan-applications/${application.id}`}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={applications} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LoanApplicationsIndex.layout = {
    breadcrumbs: [
        { title: 'Loan applications', href: '/loan-applications' },
    ],
};

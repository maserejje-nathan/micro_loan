import { Head, Link } from '@inertiajs/react';
import { Plus, Users } from 'lucide-react';
import { CustomerAvatar } from '@/components/customer-avatar';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { EntityStatusBadge } from '@/components/entity-status-badge';
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
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';

type Customer = {
    id: number;
    reference_number: string;
    full_name: string;
    phone: string;
    email: string | null;
    status: string;
    photo_url: string | null;
};

export default function CustomersIndex({
    customers,
}: {
    customers: Paginated<Customer>;
}) {
    const total = paginatorTotal(customers);

    return (
        <>
            <Head title="Customers" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage borrowers and KYC profiles
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/customers/create">
                            <Plus className="mr-2 size-4" />
                            Add customer
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle>All customers</CardTitle>
                                <CardDescription>
                                    {total} registered{' '}
                                    {total === 1 ? 'borrower' : 'borrowers'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {customers.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Users}
                                    title="No customers yet"
                                    description="Add your first borrower to start loan applications and tracking."
                                    action={
                                        <Button asChild>
                                            <Link href="/customers/create">
                                                Add customer
                                            </Link>
                                        </Button>
                                    }
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Reference
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell">
                                            Contact
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.data.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/customers/${customer.id}`}
                                                    className="flex items-center gap-3 font-medium hover:underline"
                                                >
                                                    <CustomerAvatar
                                                        name={customer.full_name}
                                                        photoUrl={
                                                            customer.photo_url
                                                        }
                                                        size="sm"
                                                    />
                                                    <span>
                                                        {customer.full_name}
                                                    </span>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                                                {customer.reference_number}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="text-sm">
                                                    {customer.phone}
                                                </div>
                                                {customer.email && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <EntityStatusBadge
                                                    status={customer.status}
                                                    type="customer"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/customers/${customer.id}`}
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
                        <DataTablePagination paginator={customers} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: [{ title: 'Customers', href: '/customers' }],
};

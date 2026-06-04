import { Head, Link } from '@inertiajs/react';
import { Layers, Package, Plus } from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
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
import { formatEnumLabel } from '@/lib/format-label';
import { formatMoney } from '@/lib/format-money';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';
import { cn } from '@/lib/utils';

type LoanProduct = {
    id: number;
    name: string;
    code: string;
    min_amount: number;
    max_amount: number;
    interest_rate: string;
    interest_type: string;
    term_min_days: number;
    term_max_days: number;
    repayment_frequency: string;
    is_active: boolean;
};

function ProductStatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
        </Badge>
    );
}

export default function LoanProductsIndex({
    products,
    currency,
    stats,
}: {
    products: Paginated<LoanProduct>;
    currency: string;
    stats: { total: number; active: number };
}) {
    const total = paginatorTotal(products);

    return (
        <>
            <Head title="Loan products" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Loan products
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure lending products, rates, and terms for
                            applications
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/loan-products/create">
                            <Plus className="mr-2 size-4" />
                            New product
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
                    <StatCard
                        title="Total products"
                        value={String(total)}
                        description="Configured in your organization"
                        icon={Package}
                    />
                    <StatCard
                        title="Active products"
                        value={String(stats.active)}
                        description="Available for new applications"
                        icon={Layers}
                        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>All products</CardTitle>
                        <CardDescription>
                            {total} loan {total === 1 ? 'product' : 'products'} ·
                            amounts in {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {products.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Package}
                                    title="No loan products yet"
                                    description="Create a product to define amount limits, interest, and repayment terms."
                                    action={
                                        <Button asChild>
                                            <Link href="/loan-products/create">
                                                Create product
                                            </Link>
                                        </Button>
                                    }
                                />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Amount range
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell">
                                            Term
                                        </TableHead>
                                        <TableHead className="hidden sm:table-cell">
                                            Pricing
                                        </TableHead>
                                        <TableHead className="hidden xl:table-cell">
                                            Repayment
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            className={cn(
                                                !product.is_active &&
                                                    'opacity-70',
                                            )}
                                        >
                                            <TableCell>
                                                <Link
                                                    href={`/loan-products/${product.id}/edit`}
                                                    className="flex items-center gap-3 hover:underline"
                                                >
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-secondary font-mono text-xs font-semibold text-primary">
                                                        {product.code
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {product.name}
                                                        </p>
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            {product.code}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="text-sm">
                                                    {formatMoney(
                                                        product.min_amount,
                                                        currency,
                                                    )}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    –{' '}
                                                </span>
                                                <span className="text-sm">
                                                    {formatMoney(
                                                        product.max_amount,
                                                        currency,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                                                {product.term_min_days}–
                                                {product.term_max_days} days
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <p className="text-sm font-medium">
                                                    {product.interest_rate}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatEnumLabel(
                                                        product.interest_type,
                                                    )}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden text-sm capitalize text-muted-foreground xl:table-cell">
                                                {formatEnumLabel(
                                                    product.repayment_frequency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ProductStatusBadge
                                                    isActive={product.is_active}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/loan-products/${product.id}/edit`}
                                                    >
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <DataTablePagination paginator={products} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LoanProductsIndex.layout = {
    breadcrumbs: [{ title: 'Loan products', href: '/loan-products' }],
};

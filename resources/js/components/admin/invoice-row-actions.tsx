import { Link, router } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { paid } from '@/routes/admin/invoices';
import { show as organizationShow } from '@/routes/admin/organizations';

type InvoiceRowActionsProps = {
    id: number;
    status: string;
    organizationId: number;
};

export function InvoiceRowActions({
    id,
    status,
    organizationId,
}: InvoiceRowActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Invoice actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={organizationShow.url(organizationId)}>
                        View organization
                    </Link>
                </DropdownMenuItem>
                {status !== 'paid' && status !== 'void' && (
                    <DropdownMenuItem
                        onClick={() => {
                            if (window.confirm('Mark this invoice as paid?')) {
                                router.post(paid.url(id));
                            }
                        }}
                    >
                        Mark as paid
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

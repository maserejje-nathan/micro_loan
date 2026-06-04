import { Link, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { destroy, edit } from '@/routes/admin/plans';

type PlanRowActionsProps = {
    id: number;
    subscriptionsCount: number;
};

export function PlanRowActions({
    id,
    subscriptionsCount,
}: PlanRowActionsProps) {
    const canDelete = subscriptionsCount === 0;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Plan actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={edit.url(id)}>
                        <Pencil className="mr-2 size-4" />
                        Edit plan
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    disabled={!canDelete}
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                        if (!canDelete) {
                            return;
                        }

                        if (window.confirm('Delete this plan permanently?')) {
                            router.delete(destroy.url(id));
                        }
                    }}
                >
                    Delete plan
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

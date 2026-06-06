import { router } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { activate, cancel, renew } from '@/routes/admin/subscriptions';

type SubscriptionRowActionsProps = {
    id: number;
    status: string;
};

export function SubscriptionRowActions({
    id,
    status,
}: SubscriptionRowActionsProps) {
    const post = (url: string, confirmMessage?: string) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
            return;
        }

        router.post(url);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Subscription actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {status !== 'active' && (
                    <DropdownMenuItem onClick={() => post(activate.url(id))}>
                        Activate
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => post(renew.url(id))}>
                    Renew period
                </DropdownMenuItem>
                {status !== 'canceled' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                                post(
                                    cancel.url(id),
                                    'Cancel this subscription? The tenant may lose access at period end.',
                                )
                            }
                        >
                            Cancel subscription
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

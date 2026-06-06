import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    ClipboardList,
    HandCoins,
    Users,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    index as notificationsIndex,
    read,
    readAll,
} from '@/routes/notifications';

export type InAppNotification = {
    id: string;
    type: string;
    title: string;
    body: string;
    action_url: string | null;
    read_at: string | null;
    created_at: string;
};

type PageProps = {
    notifications?: {
        unreadCount: number;
        recent: InAppNotification[];
    };
};

const typeIcons: Record<string, LucideIcon> = {
    'loan_application.submitted': ClipboardList,
    'loan_application.approved': ClipboardList,
    'loan_application.rejected': ClipboardList,
    'loan.disbursed': Wallet,
    'repayment.recorded': HandCoins,
    'team.invitation_accepted': Users,
};

function formatRelativeTime(dateTime: string): string {
    const diffMs = Date.now() - new Date(dateTime).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
        return 'Just now';
    }

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    }

    const diffHours = Math.floor(diffMins / 60);

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays}d ago`;
}

export function NotificationBell() {
    const { notifications } = usePage<PageProps>().props;
    const unreadCount = notifications?.unreadCount ?? 0;
    const recent = notifications?.recent ?? [];

    const markAsRead = (id: string) => {
        router.post(
            read.url(id),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const markAllAsRead = () => {
        router.post(
            readAll.url(),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-9"
                    data-test="notification-bell"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between gap-2">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="mr-1 size-3.5" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recent.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet
                    </p>
                ) : (
                    recent.map((notification) => {
                        const Icon =
                            typeIcons[notification.type] ?? ClipboardList;
                        const isUnread = !notification.read_at;

                        return (
                            <DropdownMenuItem
                                key={notification.id}
                                className="cursor-pointer items-start gap-3 p-3"
                                onClick={() => {
                                    if (isUnread) {
                                        markAsRead(notification.id);
                                    }

                                    if (notification.action_url) {
                                        router.visit(notification.action_url);
                                    }
                                }}
                            >
                                <div
                                    className={cn(
                                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                                        isUnread
                                            ? 'bg-secondary text-primary'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p
                                        className={cn(
                                            'text-sm leading-snug',
                                            isUnread && 'font-medium',
                                        )}
                                    >
                                        {notification.title}
                                    </p>
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                        {notification.body}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatRelativeTime(
                                            notification.created_at,
                                        )}
                                    </p>
                                </div>
                                {isUnread && (
                                    <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                                )}
                            </DropdownMenuItem>
                        );
                    })
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center p-2">
                    <Link
                        href={notificationsIndex().url}
                        className="w-full text-center text-sm font-medium"
                    >
                        View all notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

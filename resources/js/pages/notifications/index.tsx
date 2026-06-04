import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    ClipboardList,
    HandCoins,
    Users,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { InAppNotification } from '@/components/notification-bell';
import { DataTablePagination } from '@/components/data-table-pagination';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/pagination';
import { paginatorTotal } from '@/types/pagination';
import { index as notificationsIndex, read, readAll } from '@/routes/notifications';

const typeIcons: Record<string, LucideIcon> = {
    'loan_application.submitted': ClipboardList,
    'loan_application.approved': ClipboardList,
    'loan_application.rejected': ClipboardList,
    'loan.disbursed': Wallet,
    'repayment.recorded': HandCoins,
    'team.invitation_accepted': Users,
};

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function NotificationsIndex({
    notifications,
    unreadCount,
}: {
    notifications: Paginated<InAppNotification>;
    unreadCount: number;
}) {
    const total = paginatorTotal(notifications);

    return (
        <>
            <Head title="Notifications" />
            <div className="flex w-full flex-col gap-6 p-4 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Notifications
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {unreadCount > 0
                                ? `${unreadCount} unread`
                                : 'You are all caught up'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.post(readAll.url(), {}, { preserveScroll: true })
                            }
                        >
                            <CheckCheck className="mr-2 size-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Activity</CardTitle>
                        <CardDescription>
                            {total}{' '}
                            {total === 1 ? 'notification' : 'notifications'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.data.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    icon={Bell}
                                    title="No notifications"
                                    description="Alerts for loan workflow and team activity will appear here."
                                />
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {notifications.data.map((notification) => {
                                    const Icon =
                                        typeIcons[notification.type] ??
                                        ClipboardList;
                                    const isUnread = !notification.read_at;

                                    return (
                                        <li key={notification.id}>
                                            <button
                                                type="button"
                                                className={cn(
                                                    'flex w-full gap-4 p-4 text-left transition-colors hover:bg-muted',
                                                    isUnread && 'bg-muted',
                                                )}
                                                onClick={() => {
                                                    if (isUnread) {
                                                        router.post(
                                                            read.url(
                                                                notification.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }

                                                    if (
                                                        notification.action_url
                                                    ) {
                                                        router.visit(
                                                            notification.action_url,
                                                        );
                                                    }
                                                }}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex size-10 shrink-0 items-center justify-center rounded-lg',
                                                        isUnread
                                                            ? 'bg-secondary text-primary'
                                                            : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    <Icon className="size-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p
                                                            className={cn(
                                                                'text-sm',
                                                                isUnread &&
                                                                    'font-semibold',
                                                            )}
                                                        >
                                                            {
                                                                notification.title
                                                            }
                                                        </p>
                                                        <time className="shrink-0 text-xs text-muted-foreground">
                                                            {formatDateTime(
                                                                notification.created_at,
                                                            )}
                                                        </time>
                                                    </div>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {notification.body}
                                                    </p>
                                                    {notification.action_url && (
                                                        <p className="mt-2 text-xs font-medium text-primary">
                                                            View details →
                                                        </p>
                                                    )}
                                                </div>
                                                {isUnread && (
                                                    <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <DataTablePagination paginator={notifications} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        { title: 'Notifications', href: notificationsIndex().url },
    ],
};

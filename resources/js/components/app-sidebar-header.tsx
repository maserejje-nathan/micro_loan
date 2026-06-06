import { usePage } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:h-16 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {auth?.user && (
                <div className="shrink-0">
                    <NotificationBell />
                </div>
            )}
        </header>
    );
}

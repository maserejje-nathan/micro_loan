import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavSecondary({
    items,
    className,
}: {
    items: NavItem[];
    className?: string;
}) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className={cn('mt-auto px-2 py-0', className)}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const active =
                            item.isActive !== undefined
                                ? item.isActive
                                : item.matchPrefix
                                  ? isCurrentOrParentUrl(item.href)
                                  : isCurrentUrl(item.href);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        'rounded-none border-l-2 border-transparent',
                                        active &&
                                            'border-l-sidebar-primary data-[active=true]:bg-sidebar-accent',
                                    )}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

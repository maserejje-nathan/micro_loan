import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export type NavGroup = {
    label?: string;
    items: NavItem[];
};

type NavMainProps = {
    /** Single group (legacy). Prefer `groups` for multi-section menus. */
    items?: NavItem[];
    label?: string;
    groups?: NavGroup[];
    className?: string;
};

function isItemActive(
    item: NavItem,
    isCurrentUrl: (href: NavItem['href']) => boolean,
    isCurrentOrParentUrl: (href: NavItem['href']) => boolean,
): boolean {
    if (item.isActive !== undefined) {
        return item.isActive;
    }

    return item.matchPrefix
        ? isCurrentOrParentUrl(item.href)
        : isCurrentUrl(item.href);
}

export function NavMain({
    items = [],
    label,
    groups,
    className,
}: NavMainProps) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const resolvedGroups: NavGroup[] =
        groups && groups.length > 0
            ? groups
            : [{ label, items }];

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {resolvedGroups.map((group, groupIndex) => (
                <SidebarGroup
                    key={group.label ?? `group-${groupIndex}`}
                    className="px-2 py-0"
                >
                    {group.label && (
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const active = isItemActive(
                                item,
                                isCurrentUrl,
                                isCurrentOrParentUrl,
                            );

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
                </SidebarGroup>
            ))}
        </div>
    );
}

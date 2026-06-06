import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, LayoutGrid, Plus, User, Wallet } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import PortalLogo from '@/components/portal/portal-logo';
import { PortalNavUser } from '@/components/portal/portal-nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Overview',
        href: '/portal',
        icon: LayoutGrid,
    },
    {
        title: 'My loans',
        href: '/portal/loans',
        icon: Wallet,
        matchPrefix: true,
    },
    {
        title: 'Applications',
        href: '/portal/applications',
        icon: ClipboardList,
        matchPrefix: true,
    },
    {
        title: 'Profile',
        href: '/portal/profile',
        icon: User,
    },
];

export function PortalSidebar() {
    const { portalSettings } = usePage().props as {
        portalSettings?: { allow_applications: boolean };
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/portal" prefetch>
                                <PortalLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="My account" />
                {portalSettings?.allow_applications && (
                    <SidebarGroup className="px-2">
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/portal/applications/create/new"
                                            prefetch
                                        >
                                            <Plus />
                                            <span>New application</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <PortalNavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

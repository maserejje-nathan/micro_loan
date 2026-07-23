import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, LayoutGrid, Plus, User, Wallet } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import type { NavGroup } from '@/components/nav-main';
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
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard as portalDashboard } from '@/routes/portal';
import {
    create as applicationsCreate,
    index as applicationsIndex,
} from '@/routes/portal/applications';
import { index as loansIndex } from '@/routes/portal/loans';
import { edit as profileEdit } from '@/routes/portal/profile';

export function PortalSidebar() {
    const { portalSettings } = usePage().props as {
        portalSettings?: { allow_applications: boolean };
    };

    const mainNavGroups: NavGroup[] = [
        {
            label: 'My account',
            items: [
                {
                    title: 'Overview',
                    href: portalDashboard(),
                    icon: LayoutGrid,
                },
                {
                    title: 'My loans',
                    href: loansIndex(),
                    icon: Wallet,
                    matchPrefix: true,
                },
                {
                    title: 'Applications',
                    href: applicationsIndex(),
                    icon: ClipboardList,
                    matchPrefix: true,
                },
                {
                    title: 'Profile',
                    href: profileEdit(),
                    icon: User,
                    matchPrefix: true,
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-none"
                        >
                            <Link href={portalDashboard()} prefetch>
                                <PortalLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={mainNavGroups} />
                {portalSettings?.allow_applications && (
                    <SidebarGroup className="px-2">
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className="rounded-none border border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent"
                                        tooltip={{
                                            children: 'New application',
                                        }}
                                    >
                                        <Link
                                            href={applicationsCreate()}
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
                <SidebarSeparator className="mx-0" />
                <PortalNavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CreditCard,
    FileText,
    LayoutGrid,
    Package,
    Server,
    Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as organizationsIndex } from '@/routes/admin/organizations';
import { index as invoicesIndex } from '@/routes/admin/invoices';
import { index as plansIndex } from '@/routes/admin/plans';
import { index as subscriptionsIndex } from '@/routes/admin/subscriptions';
import { index as settingsIndex } from '@/routes/admin/settings';
import { index as systemIndex } from '@/routes/admin/system';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    { title: 'Dashboard', href: adminDashboard(), icon: LayoutGrid },
    { title: 'Organizations', href: organizationsIndex(), icon: Building2 },
    { title: 'Plans', href: plansIndex(), icon: Package },
    { title: 'Subscriptions', href: subscriptionsIndex(), icon: CreditCard },
    { title: 'Invoices', href: invoicesIndex(), icon: FileText },
    { title: 'System', href: systemIndex(), icon: Server },
    { title: 'Settings', href: settingsIndex(), icon: Settings },
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={adminDashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={adminNavItems} label="Platform admin" />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={{ children: 'Back to app' }}
                        >
                            <Link href={dashboard()} prefetch>
                                <ArrowLeft />
                                <span>Back to app</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

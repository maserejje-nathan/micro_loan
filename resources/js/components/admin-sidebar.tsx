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
import type { NavGroup } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as invoicesIndex } from '@/routes/admin/invoices';
import { index as organizationsIndex } from '@/routes/admin/organizations';
import { index as plansIndex } from '@/routes/admin/plans';
import { index as settingsIndex } from '@/routes/admin/settings';
import { index as subscriptionsIndex } from '@/routes/admin/subscriptions';
import { index as systemIndex } from '@/routes/admin/system';

const adminNavGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: adminDashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        label: 'Tenants',
        items: [
            {
                title: 'Organizations',
                href: organizationsIndex(),
                icon: Building2,
                matchPrefix: true,
            },
            {
                title: 'Plans',
                href: plansIndex(),
                icon: Package,
                matchPrefix: true,
            },
            {
                title: 'Subscriptions',
                href: subscriptionsIndex(),
                icon: CreditCard,
                matchPrefix: true,
            },
            {
                title: 'Invoices',
                href: invoicesIndex(),
                icon: FileText,
                matchPrefix: true,
            },
        ],
    },
    {
        label: 'Platform',
        items: [
            {
                title: 'System',
                href: systemIndex(),
                icon: Server,
                matchPrefix: true,
            },
            {
                title: 'Settings',
                href: settingsIndex(),
                icon: Settings,
                matchPrefix: true,
            },
        ],
    },
];

export function AdminSidebar() {
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
                            <Link href={adminDashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <p className="truncate px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    Platform admin
                </p>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={adminNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={{ children: 'Back to app' }}
                            className="rounded-none"
                        >
                            <Link href={dashboard()} prefetch>
                                <ArrowLeft />
                                <span>Back to app</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarSeparator className="mx-0" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

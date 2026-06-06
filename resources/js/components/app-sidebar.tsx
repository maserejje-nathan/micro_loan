import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    FileText,
    HandCoins,
    LayoutGrid,
    PiggyBank,
    ScrollText,
    Users,
    Wallet,
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Customers', href: '/customers', icon: Users },
    { title: 'Loan products', href: '/loan-products', icon: PiggyBank },
    { title: 'Applications', href: '/loan-applications', icon: ClipboardList },
    { title: 'Loans', href: '/loans', icon: Wallet },
    { title: 'Repayments', href: '/repayments', icon: HandCoins },
    { title: 'Reports', href: '/reports', icon: FileText },
    { title: 'Audit logs', href: '/audit-logs', icon: ScrollText },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

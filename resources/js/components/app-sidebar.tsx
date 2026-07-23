import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    FileText,
    HandCoins,
    LayoutGrid,
    PiggyBank,
    ScrollText,
    Settings,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import type { NavGroup } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
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
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import { index as auditLogsIndex } from '@/routes/audit-logs';
import { index as customersIndex } from '@/routes/customers';
import { index as loanApplicationsIndex } from '@/routes/loan-applications';
import { index as loanProductsIndex } from '@/routes/loan-products';
import { index as loansIndex } from '@/routes/loans';
import { edit as profileEdit } from '@/routes/profile';
import { index as repaymentsIndex } from '@/routes/repayments';
import { index as reportsIndex } from '@/routes/reports';
import type { Auth } from '@/types';

const mainNavGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        label: 'Lending',
        items: [
            {
                title: 'Customers',
                href: customersIndex(),
                icon: Users,
                matchPrefix: true,
            },
            {
                title: 'Loan products',
                href: loanProductsIndex(),
                icon: PiggyBank,
                matchPrefix: true,
            },
            {
                title: 'Applications',
                href: loanApplicationsIndex(),
                icon: ClipboardList,
                matchPrefix: true,
            },
            {
                title: 'Loans',
                href: loansIndex(),
                icon: Wallet,
                matchPrefix: true,
            },
            {
                title: 'Repayments',
                href: repaymentsIndex(),
                icon: HandCoins,
                matchPrefix: true,
            },
        ],
    },
    {
        label: 'Insights',
        items: [
            {
                title: 'Reports',
                href: reportsIndex(),
                icon: FileText,
                matchPrefix: true,
            },
            {
                title: 'Audit logs',
                href: auditLogsIndex(),
                icon: ScrollText,
                matchPrefix: true,
            },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: Auth };
    const { isCurrentOrParentUrl } = useCurrentUrl();

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
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {auth.organization?.name && (
                    <p className="truncate px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {auth.organization.name}
                    </p>
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={mainNavGroups} />
                <NavSecondary
                    items={[
                        {
                            title: 'Settings',
                            href: profileEdit(),
                            icon: Settings,
                            isActive: isCurrentOrParentUrl('/settings'),
                        },
                    ]}
                />
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator className="mx-0" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

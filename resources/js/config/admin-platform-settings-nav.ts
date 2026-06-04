import type { LucideIcon } from 'lucide-react';
import {
    Bell,
    Globe,
    LayoutGrid,
    Mail,
    MessageSquare,
    Smartphone,
    Wallet,
} from 'lucide-react';
import {
    africasTalking,
    index as settingsIndex,
    notifications,
    smtp,
    welcome,
    yoPayments,
} from '@/routes/admin/settings';

export type PlatformSettingsNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    description?: string;
};

export type PlatformSettingsNavGroup = {
    label: string;
    items: PlatformSettingsNavItem[];
};

export const platformSettingsNavGroups: PlatformSettingsNavGroup[] = [
    {
        label: 'Overview',
        items: [
            {
                title: 'All settings',
                href: settingsIndex().url,
                icon: LayoutGrid,
                description: 'Summary and quick links',
            },
        ],
    },
    {
        label: 'Marketing',
        items: [
            {
                title: 'Welcome page',
                href: welcome().url,
                icon: Globe,
                description: 'Public home page content',
            },
        ],
    },
    {
        label: 'Notifications',
        items: [
            {
                title: 'Message types',
                href: notifications().url,
                icon: MessageSquare,
                description: 'SMS driver and automated messages',
            },
            {
                title: "Africa's Talking",
                href: africasTalking().url,
                icon: Smartphone,
                description: 'SMS API credentials',
            },
            {
                title: 'Email (SMTP)',
                href: smtp().url,
                icon: Mail,
                description: 'Outbound email delivery',
            },
        ],
    },
    {
        label: 'Payments',
        items: [
            {
                title: 'Yo! Payments',
                href: yoPayments().url,
                icon: Wallet,
                description: 'Mobile money integration',
            },
        ],
    },
];

export const platformSettingsOverviewLinks = [
    {
        group: 'Marketing',
        icon: Globe,
        items: platformSettingsNavGroups[1].items,
    },
    {
        group: 'Notifications',
        icon: Bell,
        items: platformSettingsNavGroups[2].items,
    },
    {
        group: 'Payments',
        icon: Wallet,
        items: platformSettingsNavGroups[3].items,
    },
];

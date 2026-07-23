import {
    CreditCard,
    Globe,
    Palette,
    Shield,
    User,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { index as billingIndex } from '@/routes/settings/billing';
import { edit as editPortal } from '@/routes/settings/portal';
import { index as teamIndex } from '@/routes/settings/team';

export type SettingsNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    description: string;
};

export type SettingsNavGroup = {
    label: string;
    items: SettingsNavItem[];
};

export const settingsNavGroups: SettingsNavGroup[] = [
    {
        label: 'Account',
        items: [
            {
                title: 'Profile',
                href: editProfile().url,
                icon: User,
                description: 'Name and email',
            },
            {
                title: 'Security',
                href: editSecurity().url,
                icon: Shield,
                description: 'Password and two-factor',
            },
            {
                title: 'Appearance',
                href: editAppearance().url,
                icon: Palette,
                description: 'Theme preference',
            },
        ],
    },
    {
        label: 'Workspace',
        items: [
            {
                title: 'Team',
                href: teamIndex().url,
                icon: Users,
                description: 'Invites and roles',
            },
            {
                title: 'Billing',
                href: billingIndex().url,
                icon: CreditCard,
                description: 'Plan and invoices',
            },
            {
                title: 'Client portal',
                href: editPortal().url,
                icon: Globe,
                description: 'Borrower access',
            },
        ],
    },
];

export function settingsNavFlat(): SettingsNavItem[] {
    return settingsNavGroups.flatMap((group) => group.items);
}

export function settingsTitleForPath(pathname: string): string {
    const match = settingsNavFlat().find((item) => item.href === pathname);

    return match?.title ?? 'Settings';
}

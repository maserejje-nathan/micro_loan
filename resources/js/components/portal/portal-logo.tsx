import { usePage } from '@inertiajs/react';
import { AppBrandMark } from '@/components/app-brand-mark';
import { cn } from '@/lib/utils';

type PortalAuth = {
    organization?: { name: string } | null;
};

export default function PortalLogo() {
    const { auth, name, logoUrl } = usePage().props as {
        auth?: PortalAuth;
        name?: string;
        logoUrl?: string | null;
    };

    const organizationName =
        auth?.organization?.name ?? name ?? 'Client portal';

    return (
        <>
            <div
                className={cn(
                    'flex shrink-0 items-center justify-center overflow-hidden',
                    logoUrl
                        ? 'size-9'
                        : 'aspect-square size-8 rounded-md bg-sidebar-primary text-sidebar-primary-foreground',
                )}
            >
                <AppBrandMark
                    className={logoUrl ? 'size-9' : 'size-5'}
                    imageClassName="size-9"
                    iconClassName="size-5 fill-current text-white dark:text-black"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    {organizationName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Client portal
                </span>
            </div>
        </>
    );
}

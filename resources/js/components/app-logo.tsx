import { usePage } from '@inertiajs/react';
import { AppBrandMark } from '@/components/app-brand-mark';
import { cn } from '@/lib/utils';

type AppLogoProps = {
    showName?: boolean;
    className?: string;
};

export default function AppLogo({ showName = true, className }: AppLogoProps) {
    const { name, logoUrl } = usePage<{
        name?: string;
        logoUrl?: string | null;
    }>().props;

    const appName = name ?? 'LendFlow';

    return (
        <div className={cn('flex items-center gap-2', className)}>
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
                    iconClassName="size-5"
                />
            </div>
            {showName && (
                <div className="grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        {appName}
                    </span>
                </div>
            )}
        </div>
    );
}

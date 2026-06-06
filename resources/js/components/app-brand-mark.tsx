import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

type AppBrandMarkProps = {
    className?: string;
    iconClassName?: string;
    imageClassName?: string;
};

export function AppBrandMark({
    className,
    iconClassName,
    imageClassName,
}: AppBrandMarkProps) {
    const { logoUrl, name } = usePage<{
        logoUrl?: string | null;
        name?: string;
    }>().props;

    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt={name ? `${name} logo` : 'Logo'}
                className={cn('object-contain', imageClassName, className)}
            />
        );
    }

    return (
        <AppLogoIcon
            className={cn(
                'fill-current text-white dark:text-black',
                iconClassName,
                className,
            )}
        />
    );
}

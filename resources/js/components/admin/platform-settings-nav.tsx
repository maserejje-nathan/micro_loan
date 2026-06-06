import { Link } from '@inertiajs/react';
import { platformSettingsNavGroups } from '@/config/admin-platform-settings-nav';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';

export function PlatformSettingsNav() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav className="flex flex-col gap-6" aria-label="Platform settings">
            {platformSettingsNavGroups.map((group) => (
                <div key={group.label}>
                    <p className="mb-2 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {group.label}
                    </p>
                    <ul className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const active = isCurrentUrl(item.href);
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                            active
                                                ? 'bg-secondary text-foreground'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'mt-0.5 size-4 shrink-0',
                                                active
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground',
                                            )}
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block leading-none font-medium">
                                                {item.title}
                                            </span>
                                            {item.description && (
                                                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                                    {item.description}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

export function platformSettingsNavFlat() {
    return platformSettingsNavGroups.flatMap((group) => group.items);
}

export function platformSettingsTitleForPath(pathname: string): string {
    const match = platformSettingsNavFlat().find(
        (item) => toUrl(item.href) === pathname,
    );

    return match?.title ?? 'Platform settings';
}

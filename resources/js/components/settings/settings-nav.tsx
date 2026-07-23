import { Link } from '@inertiajs/react';
import { settingsNavGroups } from '@/config/settings-nav';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

export function SettingsNav() {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <>
            <nav
                className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-1 lg:hidden"
                aria-label="Settings"
            >
                {settingsNavGroups.flatMap((group) =>
                    group.items.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'inline-flex shrink-0 items-center gap-2 border px-3 py-2 text-sm transition-colors',
                                    active
                                        ? 'border-foreground bg-foreground text-background'
                                        : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                                )}
                            >
                                <Icon className="size-3.5" />
                                {item.title}
                            </Link>
                        );
                    }),
                )}
            </nav>

            <nav
                className="hidden flex-col gap-6 lg:flex"
                aria-label="Settings"
            >
                {settingsNavGroups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {group.label}
                        </p>
                        <ul className="flex flex-col gap-0.5">
                            {group.items.map((item) => {
                                const active = isCurrentOrParentUrl(item.href);
                                const Icon = item.icon;

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'relative flex items-start gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors',
                                                active
                                                    ? 'border-l-foreground bg-muted text-foreground'
                                                    : 'border-l-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'mt-0.5 size-4 shrink-0',
                                                    active
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground',
                                                )}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block leading-none font-medium">
                                                    {item.title}
                                                </span>
                                                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                                                    {item.description}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </>
    );
}

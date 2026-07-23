import { Link } from '@inertiajs/react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
    statCardTones,
    toneFromAccentClass,
    toneFromTitle,
} from '@/lib/stat-card-tones';
import type { StatCardTone } from '@/lib/stat-card-tones';
import { cn } from '@/lib/utils';

type StatCardProps = {
    title: string;
    value: string;
    description?: string;
    icon?: LucideIcon;
    href?: string;
    /** Solid color theme for the accent bar and icon well. */
    tone?: StatCardTone;
    /** @deprecated Use `tone` instead. Still maps emerald/amber/violet/etc. from legacy classes. */
    accentClassName?: string;
    className?: string;
};

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    href,
    tone,
    accentClassName,
    className,
}: StatCardProps) {
    const resolvedTone =
        tone ?? toneFromAccentClass(accentClassName) ?? toneFromTitle(title);
    const palette = statCardTones[resolvedTone];

    const content = (
        <Card
            className={cn(
                'group relative gap-0 overflow-hidden py-0 shadow-none transition-colors',
                palette.card,
                href &&
                    'hover:border-foreground/20 hover:bg-muted/40 dark:hover:bg-muted/20',
                className,
            )}
        >
            <div
                className={cn(
                    'absolute inset-y-0 left-0 w-1',
                    palette.accent,
                )}
                aria-hidden
            />
            <CardContent className="flex items-start gap-3 p-4 pl-5 sm:gap-4 sm:p-5 sm:pl-6">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {title}
                        </p>
                        {Icon && (
                            <div
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center',
                                    palette.icon,
                                )}
                            >
                                <Icon className="size-4" />
                            </div>
                        )}
                    </div>
                    <p className="text-2xl leading-none font-semibold tracking-tight break-words tabular-nums sm:text-[1.75rem]">
                        {value}
                    </p>
                    {(description || href) && (
                        <div className="flex flex-wrap items-end justify-between gap-2 pt-0.5">
                            {description ? (
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            ) : (
                                <span />
                            )}
                            {href && (
                                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-foreground/70 transition-colors group-hover:text-foreground">
                                    View
                                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="block rounded-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                {content}
            </Link>
        );
    }

    return content;
}

import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
    statCardTones,
    toneFromAccentClass,
    toneFromTitle,
    type StatCardTone,
} from '@/lib/stat-card-tones';
import { cn } from '@/lib/utils';

type StatCardProps = {
    title: string;
    value: string;
    description?: string;
    icon?: LucideIcon;
    href?: string;
    /** Solid color theme for the card surface and icon well. */
    tone?: StatCardTone;
    /** @deprecated Use `tone` instead. Still maps emerald/amber/violet/etc. from legacy classes. */
    accentClassName?: string;
};

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    href,
    tone,
    accentClassName,
}: StatCardProps) {
    const resolvedTone =
        tone ?? toneFromAccentClass(accentClassName) ?? toneFromTitle(title);
    const palette = statCardTones[resolvedTone];

    const content = (
        <Card
            className={cn(
                'border shadow-sm transition-colors',
                palette.card,
                href && 'hover:brightness-[0.98] dark:hover:brightness-110',
            )}
        >
            <CardContent className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                {Icon && (
                    <div
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-lg',
                            palette.icon,
                        )}
                    >
                        <Icon className="size-5" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

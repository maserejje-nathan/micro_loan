import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { statCardTones } from '@/lib/stat-card-tones';
import type { StatCardTone } from '@/lib/stat-card-tones';
import { cn } from '@/lib/utils';

type HealthStatCardProps = {
    label: string;
    value: string;
    ok?: boolean;
    icon: LucideIcon;
    description?: string;
    tone?: StatCardTone;
};

export function HealthStatCard({
    label,
    value,
    ok,
    icon: Icon,
    description,
    tone = 'slate',
}: HealthStatCardProps) {
    const showStatus = ok !== undefined;
    const statusTone: StatCardTone | null = showStatus
        ? ok
            ? 'emerald'
            : 'destructive'
        : null;
    const palette = statCardTones[statusTone ?? tone];

    return (
        <Card
            className={cn(
                'relative gap-0 overflow-hidden border py-0 shadow-none',
                palette.card,
            )}
        >
            <div
                className={cn('absolute inset-y-0 left-0 w-1', palette.accent)}
                aria-hidden
            />
            <CardContent className="flex items-start gap-4 p-5 pl-6">
                <div
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center',
                        palette.icon,
                    )}
                >
                    <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {label}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-2xl font-semibold tracking-tight tabular-nums">
                            {value}
                        </p>
                        {showStatus && (
                            <Badge variant={ok ? 'default' : 'destructive'}>
                                {ok ? 'OK' : 'Error'}
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { statCardTones  } from '@/lib/stat-card-tones';
import type {StatCardTone} from '@/lib/stat-card-tones';
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
        <Card className={cn('border shadow-sm', palette.card)}>
            <CardContent className="flex items-start gap-4 p-5">
                <div
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-lg',
                        palette.icon,
                    )}
                >
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {label}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-2xl font-semibold tracking-tight">
                            {value}
                        </p>
                        {showStatus && (
                            <Badge variant={ok ? 'default' : 'destructive'}>
                                {ok ? 'OK' : 'Error'}
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

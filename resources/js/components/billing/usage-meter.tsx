import { cn } from '@/lib/utils';

type UsageMeterProps = {
    label: string;
    used: number;
    limit: number | null;
};

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
    const hasLimit = limit !== null && limit > 0;
    const percent = hasLimit
        ? Math.min(100, Math.round((used / limit) * 100))
        : 0;
    const atLimit = hasLimit && used >= limit;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span
                    className={cn(
                        'tabular-nums text-muted-foreground',
                        atLimit && 'font-medium text-amber-600 dark:text-amber-400',
                    )}
                >
                    {used}
                    {hasLimit ? ` / ${limit}` : ''}
                </span>
            </div>
            {hasLimit ? (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all',
                            atLimit ? 'bg-amber-500' : 'bg-primary',
                        )}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">Unlimited on this plan</p>
            )}
        </div>
    );
}

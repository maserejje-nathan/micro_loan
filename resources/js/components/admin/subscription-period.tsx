import { CalendarClock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function relativeLabel(dateTime: string): string | null {
    const target = new Date(dateTime).getTime();
    const now = Date.now();
    const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    }

    if (diffDays > 0) {
        return diffDays === 1 ? 'In 1 day' : `In ${diffDays} days`;
    }

    const past = Math.abs(diffDays);

    return past === 1 ? '1 day ago' : `${past} days ago`;
}

type SubscriptionPeriodProps = {
    status: string;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    canceledAt: string | null;
    className?: string;
};

export function SubscriptionPeriod({
    status,
    trialEndsAt,
    currentPeriodEnd,
    canceledAt,
    className,
}: SubscriptionPeriodProps) {
    if (status === 'canceled' && canceledAt) {
        return (
            <div className={cn('text-sm', className)}>
                <p className="text-muted-foreground">Canceled</p>
                <p>{formatDateTime(canceledAt)}</p>
            </div>
        );
    }

    if (status === 'trialing' && trialEndsAt) {
        const relative = relativeLabel(trialEndsAt);

        return (
            <div className={cn('text-sm', className)}>
                <p className="inline-flex items-center gap-1 font-medium text-violet-600 dark:text-violet-400">
                    <Sparkles className="size-3.5" />
                    Trial ends
                </p>
                <p>{formatDateTime(trialEndsAt)}</p>
                {relative && (
                    <p className="text-xs text-muted-foreground">{relative}</p>
                )}
            </div>
        );
    }

    if (currentPeriodEnd) {
        const relative = relativeLabel(currentPeriodEnd);
        const isPast =
            relative !== null &&
            relative !== 'Today' &&
            !relative.startsWith('In ');

        return (
            <div className={cn('text-sm', className)}>
                <p
                    className={cn(
                        'inline-flex items-center gap-1 font-medium',
                        isPast
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground',
                    )}
                >
                    <CalendarClock className="size-3.5" />
                    Period end
                </p>
                <p>{formatDateTime(currentPeriodEnd)}</p>
                {relative && (
                    <p
                        className={cn(
                            'text-xs',
                            isPast
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-muted-foreground',
                        )}
                    >
                        {relative}
                    </p>
                )}
            </div>
        );
    }

    return <span className="text-sm text-muted-foreground">—</span>;
}

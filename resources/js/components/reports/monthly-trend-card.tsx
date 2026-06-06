import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';

function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-').map(Number);

    if (!year || !month) {
        return monthKey;
    }

    return new Date(year, month - 1).toLocaleDateString('en-UG', {
        month: 'short',
        year: 'numeric',
    });
}

function sortedMonthEntries(data: Record<string, number>, limit = 6) {
    return Object.entries(data)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, limit);
}

type MonthlyTrendCardProps = {
    title: string;
    description: string;
    data: Record<string, number>;
    currency: string;
    barClassName?: string;
    emptyMessage?: string;
};

export function MonthlyTrendCard({
    title,
    description,
    data,
    currency,
    barClassName = 'bg-primary',
    emptyMessage = 'No data for this period yet.',
}: MonthlyTrendCardProps) {
    const entries = sortedMonthEntries(data);
    const maxValue = Math.max(...entries.map(([, value]) => value), 1);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);

    return (
        <Card className="flex flex-col">
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {entries.length > 0 && (
                    <p className="pt-1 text-sm font-medium">
                        {formatMoney(total, currency)}{' '}
                        <span className="font-normal text-muted-foreground">
                            in last {entries.length}{' '}
                            {entries.length === 1 ? 'month' : 'months'}
                        </span>
                    </p>
                )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 pt-5">
                {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {entries.map(([month, value]) => {
                            const width = Math.max(
                                (value / maxValue) * 100,
                                value > 0 ? 4 : 0,
                            );

                            return (
                                <li key={month} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2 text-sm">
                                        <span className="text-muted-foreground">
                                            {formatMonthLabel(month)}
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatMoney(value, currency)}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                barClassName,
                                            )}
                                            style={{ width: `${width}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

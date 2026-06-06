import { Badge } from '@/components/ui/badge';
import { formatEnumLabel } from '@/lib/format-label';
import type { BadgeTone } from '@/lib/status-badge';
import { cn } from '@/lib/utils';

function paymentChannelTone(channel: string): BadgeTone {
    switch (channel) {
        case 'mobile_money':
            return 'secondary';
        case 'cash':
            return 'default';
        case 'bank':
            return 'outline';
        default:
            return 'outline';
    }
}

export function PaymentChannelBadge({
    channel,
    className,
}: {
    channel: string;
    className?: string;
}) {
    return (
        <Badge
            variant={paymentChannelTone(channel)}
            className={cn('capitalize', className)}
        >
            {formatEnumLabel(channel)}
        </Badge>
    );
}

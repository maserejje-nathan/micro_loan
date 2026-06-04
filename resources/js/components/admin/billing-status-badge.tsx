import { Badge } from '@/components/ui/badge';
import {
    formatStatusLabel,
    invoiceStatusTone,
    subscriptionStatusTone,
    type BadgeTone,
} from '@/lib/status-badge';
import { cn } from '@/lib/utils';

type BillingStatusBadgeProps = {
    status: string;
    type: 'subscription' | 'invoice';
    className?: string;
};

function toneForType(
    type: BillingStatusBadgeProps['type'],
    status: string,
): BadgeTone {
    switch (type) {
        case 'subscription':
            return subscriptionStatusTone(status);
        case 'invoice':
            return invoiceStatusTone(status);
    }
}

export function BillingStatusBadge({
    status,
    type,
    className,
}: BillingStatusBadgeProps) {
    return (
        <Badge
            variant={toneForType(type, status)}
            className={cn('capitalize', className)}
        >
            {formatStatusLabel(status)}
        </Badge>
    );
}

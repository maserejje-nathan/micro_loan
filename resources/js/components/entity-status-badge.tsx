import { Badge } from '@/components/ui/badge';
import {
    customerStatusTone,
    formatStatusLabel,
    loanApplicationStatusTone,
    loanStatusTone,
    scheduleInstallmentStatusTone,
} from '@/lib/status-badge';
import type { BadgeTone } from '@/lib/status-badge';
import { cn } from '@/lib/utils';

type EntityStatusBadgeProps = {
    status: string;
    type: 'customer' | 'loan_application' | 'loan' | 'schedule';
    className?: string;
};

function toneForType(
    type: EntityStatusBadgeProps['type'],
    status: string,
): BadgeTone {
    switch (type) {
        case 'customer':
            return customerStatusTone(status);
        case 'loan_application':
            return loanApplicationStatusTone(status);
        case 'loan':
            return loanStatusTone(status);
        case 'schedule':
            return scheduleInstallmentStatusTone(status);
    }
}

export function EntityStatusBadge({
    status,
    type,
    className,
}: EntityStatusBadgeProps) {
    const variant = toneForType(type, status);

    return (
        <Badge variant={variant} className={cn('capitalize', className)}>
            {formatStatusLabel(status)}
        </Badge>
    );
}

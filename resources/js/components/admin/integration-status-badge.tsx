import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type IntegrationStatus = {
    configured: boolean;
    connected?: boolean;
};

export function IntegrationStatusBadge({
    status,
    className,
}: {
    status: IntegrationStatus;
    className?: string;
}) {
    const variant = status.connected
        ? 'default'
        : status.configured
          ? 'secondary'
          : 'outline';

    const label = status.connected
        ? 'Active'
        : status.configured
          ? 'Configured'
          : 'Not configured';

    return (
        <Badge variant={variant} className={cn('shrink-0', className)}>
            {label}
        </Badge>
    );
}

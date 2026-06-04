import { Badge } from '@/components/ui/badge';
import { auditCategoryLabel, auditCategoryTone } from '@/lib/audit-log';
import { cn } from '@/lib/utils';

export function AuditCategoryBadge({
    category,
    className,
}: {
    category: string;
    className?: string;
}) {
    return (
        <Badge
            variant={auditCategoryTone(category)}
            className={cn('capitalize', className)}
        >
            {auditCategoryLabel(category)}
        </Badge>
    );
}

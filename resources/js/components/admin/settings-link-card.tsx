import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { IntegrationStatusBadge } from '@/components/admin/integration-status-badge';
import { cn } from '@/lib/utils';

type IntegrationStatus = {
    configured: boolean;
    connected?: boolean;
};

export function SettingsLinkCard({
    title,
    description,
    href,
    icon: Icon,
    meta,
    status,
}: {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    meta?: string;
    status?: IntegrationStatus;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'group flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-colors',
                'hover:border-primary/40 hover:bg-muted',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-accent">
                    <Icon className="size-5" />
                </div>
                {status && <IntegrationStatusBadge status={status} />}
            </div>
            <div className="mt-4 flex flex-1 flex-col gap-1">
                <p className="font-medium leading-snug">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {meta && (
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {meta}
                </p>
            )}
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Configure
                <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    );
}

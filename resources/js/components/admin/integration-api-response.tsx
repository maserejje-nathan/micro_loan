import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminFlash = {
    success?: string;
    error?: string;
    integration_response?: Record<string, unknown> | unknown[] | string | number | boolean | null;
};

export function IntegrationApiResponse({
    className,
    label = "Africa's Talking API response",
}: {
    className?: string;
    label?: string;
}) {
    const { flash } = usePage().props as { flash?: AdminFlash };
    const response = flash?.integration_response;

    if (response === undefined || response === null) {
        return null;
    }

    const statusMessage = flash?.success ?? flash?.error;
    const isSuccess = Boolean(flash?.success && !flash?.error);

    return (
        <div
            className={cn(
                'space-y-2 rounded-lg border border-border bg-muted p-3',
                className,
            )}
        >
            {statusMessage && (
                <div
                    className={cn(
                        'flex items-start gap-2 text-sm',
                        isSuccess ? 'text-foreground' : 'text-destructive',
                    )}
                >
                    {isSuccess ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                    ) : (
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    )}
                    <span>{statusMessage}</span>
                </div>
            )}
            <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>
                <pre className="max-h-64 overflow-auto rounded-md border bg-background p-3 font-mono text-xs leading-relaxed">
                    {JSON.stringify(response, null, 2)}
                </pre>
            </div>
        </div>
    );
}

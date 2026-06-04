import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlatformSettingsFlash() {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string };
    };

    if (!flash?.success && !flash?.error) {
        return null;
    }

    const isSuccess = Boolean(flash.success && !flash.error);
    const message = flash.success ?? flash.error;

    return (
        <div
            className={cn(
                'flex items-start gap-2 rounded-lg border px-4 py-3 text-sm',
                isSuccess
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
                    : 'border-destructive/30 bg-destructive/10 text-destructive',
            )}
        >
            {isSuccess ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{message}</span>
        </div>
    );
}

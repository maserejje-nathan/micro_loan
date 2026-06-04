import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type AuthStatusAlertProps = {
    message: string;
    variant?: 'success' | 'info';
};

export function AuthStatusAlert({
    message,
    variant = 'info',
}: AuthStatusAlertProps) {
    const Icon = variant === 'success' ? CheckCircle2 : AlertCircle;

    return (
        <Alert
            className={cn(
                variant === 'success' &&
                    'border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100',
            )}
        >
            <Icon className="size-4" />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

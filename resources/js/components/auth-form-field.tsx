import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type AuthFormFieldProps = {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    labelAction?: ReactNode;
    children: ReactNode;
};

export function AuthFormField({
    id,
    label,
    error,
    hint,
    required = false,
    className,
    labelAction,
    children,
}: AuthFormFieldProps) {
    return (
        <div className={cn('grid gap-2', className)}>
            <div className="flex items-center justify-between gap-2">
                <Label htmlFor={id} className="text-foreground">
                    {label}
                    {required && (
                        <span className="text-destructive" aria-hidden>
                            {' '}
                            *
                        </span>
                    )}
                </Label>
                {labelAction}
            </div>
            {children}
            {hint && !error && (
                <p id={`${id}-hint`} className="text-xs text-muted-foreground">
                    {hint}
                </p>
            )}
            <InputError message={error} />
        </div>
    );
}

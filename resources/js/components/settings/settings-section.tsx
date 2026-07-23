import type { PropsWithChildren, ReactNode } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function SettingsPageHeader({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <header className="space-y-1 border-b border-border pb-4">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}

export function SettingsSection({
    title,
    description,
    children,
    className,
    contentClassName,
    footer,
}: PropsWithChildren<{
    title: string;
    description?: string;
    className?: string;
    contentClassName?: string;
    footer?: ReactNode;
}>) {
    return (
        <Card className={cn('gap-0 py-0 shadow-none', className)}>
            <CardHeader className="border-b py-4">
                <CardTitle className="text-base">{title}</CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className={cn('p-6', contentClassName)}>
                {children}
            </CardContent>
            {footer}
        </Card>
    );
}

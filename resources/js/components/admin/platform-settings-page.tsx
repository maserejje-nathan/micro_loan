import type { PropsWithChildren, ReactNode } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlatformSettingsFlash } from '@/components/admin/platform-settings-flash';
import { cn } from '@/lib/utils';

type PlatformSettingsPageProps = PropsWithChildren<{
    title: string;
    description?: string;
    cardTitle?: string;
    cardDescription?: string;
    headerAction?: ReactNode;
    className?: string;
}>;

export function PlatformSettingsPage({
    title,
    description,
    cardTitle,
    cardDescription,
    headerAction,
    className,
    children,
}: PlatformSettingsPageProps) {
    const body = cardTitle ? (
        <Card>
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                {cardDescription && (
                    <CardDescription>{cardDescription}</CardDescription>
                )}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    ) : (
        children
    );

    return (
        <div className={cn('space-y-6', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {headerAction}
            </div>

            <PlatformSettingsFlash />

            {body}
        </div>
    );
}

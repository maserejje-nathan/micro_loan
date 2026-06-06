import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { AppBrandMark } from '@/components/app-brand-mark';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
export default function PortalCardLayout({
    children,
    title,
    description,
    organizationName,
    size = 'default',
}: PropsWithChildren<{
    title?: string;
    description?: string;
    organizationName?: string;
    size?: 'default' | 'lg' | 'xl';
}>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted px-3 py-6 sm:p-6 md:p-10">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
                aria-hidden
            />

            <div
                className={cn(
                    'relative flex w-full flex-col gap-6',
                    size === 'xl'
                        ? 'max-w-4xl'
                        : size === 'lg'
                          ? 'max-w-3xl'
                          : 'max-w-xl',
                )}
            >
                <div className="flex flex-col items-center gap-3">
                    <div
                        className={cn(
                            'flex items-center justify-center overflow-hidden',
                            'size-12',
                        )}
                    >
                        <AppBrandMark
                            className="size-12"
                            imageClassName="max-h-12 max-w-40 object-contain"
                            iconClassName="size-8 fill-current text-primary"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold tracking-tight">
                            {organizationName ?? 'Client portal'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Borrower self-service
                        </p>
                    </div>
                </div>

                <Card variant="default" className="rounded-xl shadow-md">
                    <CardHeader className="space-y-1 px-4 pt-6 pb-0 text-center sm:px-10 sm:pt-8">
                        <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-sm sm:text-base">
                                {description}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="px-4 py-6 sm:px-10 sm:py-8">
                        {children}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    Need help? Contact your lender for portal access.
                </p>
            </div>
        </div>
    );
}

import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogo from '@/components/app-logo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
    size = 'default',
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
    size?: 'default' | 'lg';
}>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
                aria-hidden
            />

            <div
                className={cn(
                    'relative flex w-full flex-col gap-6',
                    size === 'lg' ? 'max-w-2xl' : 'max-w-xl',
                )}
            >
                <Link
                    href={home()}
                    className="flex justify-center transition-opacity hover:opacity-80"
                >
                    <AppLogo />
                </Link>

                <Card variant="default" className="rounded-xl shadow-md">
                    <CardHeader className="space-y-1 px-6 pt-8 pb-0 text-center sm:px-10">
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-base">
                                {description}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="px-6 py-8 sm:px-10">
                        {children}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    <Link
                        href={home()}
                        className="underline-offset-4 hover:underline"
                    >
                        ← Back to home
                    </Link>
                </p>
            </div>
        </div>
    );
}

import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FormPageShellProps = PropsWithChildren<{
    backHref: string;
    backLabel?: string;
    title: string;
    description?: string;
    cardTitle: string;
    cardDescription?: string;
    /** `full` spans the main content area (default). Other sizes cap width and center. */
    maxWidth?: 'full' | 'md' | 'lg' | '2xl' | '3xl' | '4xl' | '5xl';
    headerAction?: ReactNode;
}>;

const constrainedWidthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
} as const;

export function FormPageShell({
    backHref,
    backLabel = 'Back',
    title,
    description,
    cardTitle,
    cardDescription,
    maxWidth = 'full',
    headerAction,
    children,
}: FormPageShellProps) {
    const isFullWidth = maxWidth === 'full';

    return (
        <div
            className={cn(
                'w-full min-w-0 p-4 pb-10',
                !isFullWidth && cn('mx-auto', constrainedWidthClass[maxWidth]),
            )}
        >
            <Button
                variant="ghost"
                size="sm"
                className="mb-4 -ml-2 text-muted-foreground"
                asChild
            >
                <Link href={backHref}>
                    <ArrowLeft className="mr-1 size-4" />
                    {backLabel}
                </Link>
            </Button>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <Heading title={title} description={description} />
                {headerAction}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{cardTitle}</CardTitle>
                    {cardDescription && (
                        <CardDescription>{cardDescription}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </div>
    );
}

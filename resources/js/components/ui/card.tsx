import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva(
    'text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
    {
        variants: {
            variant: {
                default: 'border-border bg-card',
                muted: 'border-border bg-muted text-foreground',
                secondary: 'border-border bg-secondary text-secondary-foreground',
                accent: 'border-border bg-accent text-accent-foreground',
                primary:
                    'border-primary/25 bg-primary text-primary-foreground',
                warning:
                    'border-amber-200 bg-amber-50 text-foreground dark:border-amber-800 dark:bg-amber-950',
                destructive:
                    'border-red-200 bg-red-50 text-foreground dark:border-red-900 dark:bg-red-950',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Card({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
    return (
        <div
            data-slot="card"
            className={cn(cardVariants({ variant }), className)}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn('flex flex-col gap-1.5 px-6', className)}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-title"
            className={cn('leading-none font-semibold', className)}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-content"
            className={cn('px-6', className)}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-footer"
            className={cn('flex items-center px-6', className)}
            {...props}
        />
    );
}

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
    cardVariants,
};

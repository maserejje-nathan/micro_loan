import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

/**
 * Standard portal page padding and vertical rhythm — tighter on small screens.
 */
export function PortalPage({
    children,
    className,
}: PropsWithChildren<{ className?: string }>) {
    return (
        <div
            className={cn(
                'flex flex-1 flex-col gap-5 px-3 pb-10 sm:gap-6 sm:px-4',
                className,
            )}
        >
            {children}
        </div>
    );
}

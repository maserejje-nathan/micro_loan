import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StoreLinkProps = {
    href: string | null | undefined;
    label: string;
    store: string;
    icon: ReactNode;
    variant?: 'light' | 'dark';
};

function StoreLink({
    href,
    label,
    store,
    icon,
    variant = 'light',
}: StoreLinkProps) {
    const isLive = Boolean(href);
    const className = cn(
        'inline-flex min-w-[11.5rem] items-center gap-3 border px-4 py-3 text-left transition-colors',
        variant === 'light'
            ? 'border-[#12201B] bg-[#12201B] text-white hover:bg-[#0B2420]'
            : 'border-white/25 bg-white/5 text-white hover:bg-white/10',
        !isLive && 'pointer-events-none opacity-60',
    );

    const content = (
        <>
            <span className="shrink-0" aria-hidden>
                {icon}
            </span>
            <span className="min-w-0">
                <span className="block text-[0.65rem] leading-none tracking-wide uppercase opacity-70">
                    {isLive ? label : 'Coming soon'}
                </span>
                <span className="mt-1 block text-sm font-semibold tracking-tight">
                    {store}
                </span>
            </span>
        </>
    );

    if (!isLive) {
        return (
            <span className={className} aria-disabled="true">
                {content}
            </span>
        );
    }

    return (
        <a
            href={href!}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {content}
        </a>
    );
}

function AppleIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            aria-hidden
        >
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
        </svg>
    );
}

function PlayIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            aria-hidden
        >
            <path d="M3.6 2.7c-.3.2-.5.5-.5.9v16.8c0 .4.2.7.5.9l.1.1 9.4-9.4v-.2L3.7 2.6zm11.1 6.3-2.1 2.1 2.1 2.1 4.9-2.8c.5-.3.5-1 0-1.3zM13.6 13.5l-2.1 2.1 5.9 3.4c.5-.3.8-.6.9-1zM5.1 3.6l8.1 4.7 2.1-2.1z" />
        </svg>
    );
}

export function WelcomeMobileAppLinks({
    iosUrl,
    androidUrl,
    variant = 'light',
    className,
}: {
    iosUrl?: string | null;
    androidUrl?: string | null;
    variant?: 'light' | 'dark';
    className?: string;
}) {
    return (
        <div className={cn('flex flex-wrap gap-3', className)}>
            <StoreLink
                href={iosUrl}
                label="Download on the"
                store="App Store"
                variant={variant}
                icon={<AppleIcon className="size-7" />}
            />
            <StoreLink
                href={androidUrl}
                label="Get it on"
                store="Google Play"
                variant={variant}
                icon={<PlayIcon className="size-7" />}
            />
        </div>
    );
}

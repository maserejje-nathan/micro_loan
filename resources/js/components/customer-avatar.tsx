import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type CustomerAvatarProps = {
    name: string;
    photoUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizeClass = {
    sm: 'size-9 text-xs',
    md: 'size-11 text-sm',
    lg: 'size-20 text-lg',
} as const;

const iconSizeClass = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-10',
} as const;

export function CustomerAvatar({
    name,
    photoUrl,
    size = 'md',
    className,
}: CustomerAvatarProps) {
    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted font-medium text-muted-foreground',
                sizeClass[size],
                className,
            )}
        >
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={name}
                    className="size-full object-cover"
                />
            ) : (
                <span className="text-primary/80" aria-hidden>
                    {initialsFromName(name)}
                </span>
            )}
        </div>
    );
}

export function CustomerAvatarPlaceholder({
    size = 'md',
    className,
}: {
    size?: CustomerAvatarProps['size'];
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full border border-border bg-muted',
                sizeClass[size],
                className,
            )}
        >
            <User
                className={cn('text-muted-foreground/50', iconSizeClass[size])}
            />
        </div>
    );
}

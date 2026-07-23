export const statCardTones = {
    slate: {
        card: 'border-border bg-card',
        accent: 'bg-slate-500',
        icon: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    },
    blue: {
        card: 'border-border bg-card',
        accent: 'bg-blue-600',
        icon: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
    },
    sky: {
        card: 'border-border bg-card',
        accent: 'bg-sky-600',
        icon: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
    },
    emerald: {
        card: 'border-border bg-card',
        accent: 'bg-emerald-600',
        icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    },
    amber: {
        card: 'border-border bg-card',
        accent: 'bg-amber-500',
        icon: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    },
    violet: {
        card: 'border-border bg-card',
        accent: 'bg-violet-600',
        icon: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
    },
    rose: {
        card: 'border-border bg-card',
        accent: 'bg-rose-600',
        icon: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
    },
    destructive: {
        card: 'border-border bg-card',
        accent: 'bg-red-600',
        icon: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
    },
} as const;

export type StatCardTone = keyof typeof statCardTones;

export const statCardToneRotation: StatCardTone[] = [
    'blue',
    'emerald',
    'amber',
    'violet',
    'sky',
    'rose',
];

export function toneFromTitle(title: string): StatCardTone {
    let hash = 0;

    for (let i = 0; i < title.length; i++) {
        hash = (hash + title.charCodeAt(i)) % statCardToneRotation.length;
    }

    return statCardToneRotation[hash] ?? 'blue';
}

export function toneFromAccentClass(
    accentClassName?: string,
): StatCardTone | undefined {
    if (!accentClassName) {
        return undefined;
    }

    if (accentClassName.includes('emerald')) {
        return 'emerald';
    }

    if (accentClassName.includes('amber')) {
        return 'amber';
    }

    if (accentClassName.includes('violet')) {
        return 'violet';
    }

    if (accentClassName.includes('sky')) {
        return 'sky';
    }

    if (accentClassName.includes('rose')) {
        return 'rose';
    }

    if (
        accentClassName.includes('destructive') ||
        accentClassName.includes('red')
    ) {
        return 'destructive';
    }

    if (accentClassName.includes('blue')) {
        return 'blue';
    }

    return undefined;
}

export const statCardTones = {
    slate: {
        card: 'border-slate-200 bg-slate-100 text-foreground dark:border-slate-700 dark:bg-slate-900',
        icon: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    },
    blue: {
        card: 'border-blue-200 bg-blue-50 text-foreground dark:border-blue-900 dark:bg-blue-950',
        icon: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    },
    sky: {
        card: 'border-sky-200 bg-sky-50 text-foreground dark:border-sky-900 dark:bg-sky-950',
        icon: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200',
    },
    emerald: {
        card: 'border-emerald-200 bg-emerald-50 text-foreground dark:border-emerald-900 dark:bg-emerald-950',
        icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
    },
    amber: {
        card: 'border-amber-200 bg-amber-50 text-foreground dark:border-amber-900 dark:bg-amber-950',
        icon: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    },
    violet: {
        card: 'border-violet-200 bg-violet-50 text-foreground dark:border-violet-900 dark:bg-violet-950',
        icon: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200',
    },
    rose: {
        card: 'border-rose-200 bg-rose-50 text-foreground dark:border-rose-900 dark:bg-rose-950',
        icon: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
    },
    destructive: {
        card: 'border-red-200 bg-red-50 text-foreground dark:border-red-900 dark:bg-red-950',
        icon: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
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

export function toneFromAccentClass(accentClassName?: string): StatCardTone | undefined {
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

    if (accentClassName.includes('destructive') || accentClassName.includes('red')) {
        return 'destructive';
    }

    if (accentClassName.includes('blue')) {
        return 'blue';
    }

    return undefined;
}

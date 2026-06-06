import type { BadgeTone } from '@/lib/status-badge';

export function auditCategoryTone(category: string): BadgeTone {
    switch (category) {
        case 'customer':
            return 'default';
        case 'loan_application':
            return 'secondary';
        case 'loan':
            return 'default';
        case 'loan_product':
            return 'outline';
        case 'repayment':
            return 'default';
        case 'team':
            return 'secondary';
        default:
            return 'outline';
    }
}

export function auditCategoryLabel(category: string): string {
    switch (category) {
        case 'loan_application':
            return 'Applications';
        case 'loan_product':
            return 'Products';
        default:
            return (
                category.charAt(0).toUpperCase() +
                category.slice(1).replace(/_/g, ' ')
            );
    }
}

export function formatAuditValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}

export type BadgeTone = 'default' | 'secondary' | 'destructive' | 'outline';

export function customerStatusTone(status: string): BadgeTone {
    switch (status) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        case 'blacklisted':
            return 'destructive';
        default:
            return 'outline';
    }
}

export function loanApplicationStatusTone(status: string): BadgeTone {
    switch (status) {
        case 'approved':
            return 'default';
        case 'submitted':
        case 'under_review':
            return 'secondary';
        case 'rejected':
            return 'destructive';
        case 'draft':
            return 'outline';
        default:
            return 'outline';
    }
}

export function loanStatusTone(status: string): BadgeTone {
    switch (status) {
        case 'active':
            return 'default';
        case 'pending_disbursement':
            return 'secondary';
        case 'closed':
            return 'outline';
        case 'defaulted':
            return 'destructive';
        default:
            return 'outline';
    }
}

export function scheduleInstallmentStatusTone(status: string): BadgeTone {
    switch (status) {
        case 'paid':
            return 'default';
        case 'partial':
            return 'secondary';
        case 'overdue':
            return 'destructive';
        case 'pending':
            return 'outline';
        default:
            return 'outline';
    }
}

export function subscriptionStatusTone(status: string): BadgeTone {
    switch (status) {
        case 'active':
            return 'default';
        case 'trialing':
            return 'secondary';
        case 'past_due':
            return 'destructive';
        case 'paused':
            return 'outline';
        case 'canceled':
            return 'outline';
        default:
            return 'outline';
    }
}

export function invoiceStatusTone(status: string): BadgeTone {
    switch (status) {
        case 'paid':
            return 'default';
        case 'open':
            return 'secondary';
        case 'overdue':
            return 'destructive';
        case 'draft':
            return 'outline';
        case 'void':
            return 'outline';
        default:
            return 'outline';
    }
}

export function formatStatusLabel(status: string): string {
    return status.replace(/_/g, ' ');
}

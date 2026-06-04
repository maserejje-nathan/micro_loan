type PlanLimits = {
    max_users: number | null;
    max_customers: number | null;
    max_active_loans: number | null;
};

export function formatPlanLimits(plan: PlanLimits): string {
    const parts: string[] = [];

    if (plan.max_users !== null) {
        parts.push(`${plan.max_users} users`);
    }

    if (plan.max_customers !== null) {
        parts.push(`${plan.max_customers} customers`);
    }

    if (plan.max_active_loans !== null) {
        parts.push(`${plan.max_active_loans} loans`);
    }

    return parts.length > 0 ? parts.join(' · ') : 'Unlimited';
}

export function formatMoney(amount: number, currency = 'UGX'): string {
    return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

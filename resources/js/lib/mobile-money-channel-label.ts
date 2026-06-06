import { formatEnumLabel } from '@/lib/format-label';

export const MOBILE_MONEY_CHANNEL = 'mobile_money';

export type MobileMoneySummary = {
    driver: string;
    yo_configured: boolean;
    uses_yo_payments: boolean;
    driver_label: string;
    can_disburse: boolean;
};

export function mobileMoneyChannelLabel(
    paymentChannel: string,
    mobileMoney?: MobileMoneySummary,
): string {
    if (
        paymentChannel === MOBILE_MONEY_CHANNEL &&
        mobileMoney?.uses_yo_payments
    ) {
        return mobileMoney.can_disburse
            ? 'Mobile money (Yo! Payments)'
            : 'Mobile money (Yo! Payments — not configured)';
    }

    if (
        paymentChannel === MOBILE_MONEY_CHANNEL &&
        mobileMoney?.driver === 'stub'
    ) {
        return 'Mobile money (simulated)';
    }

    return formatEnumLabel(paymentChannel);
}

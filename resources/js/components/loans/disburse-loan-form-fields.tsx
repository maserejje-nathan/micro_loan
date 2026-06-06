import { useState } from 'react';
import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
    MOBILE_MONEY_CHANNEL,
    mobileMoneyChannelLabel
    
} from '@/lib/mobile-money-channel-label';
import type {MobileMoneySummary} from '@/lib/mobile-money-channel-label';
import { cn } from '@/lib/utils';

export type { MobileMoneySummary };

type DisburseLoanFormFieldsProps = {
    errors: Record<string, string | undefined>;
    paymentChannels: string[];
    defaultPhone?: string;
    mobileMoney?: MobileMoneySummary;
    defaultChannel?: string;
    /** When true, only renders mobile-money phone/provider fields (for approve form). */
    mobileMoneyOnly?: boolean;
};

export function DisburseLoanFormFields({
    errors,
    paymentChannels,
    defaultPhone = '',
    mobileMoney,
    defaultChannel,
    mobileMoneyOnly = false,
}: DisburseLoanFormFieldsProps) {
    const initialChannel =
        defaultChannel && paymentChannels.includes(defaultChannel)
            ? defaultChannel
            : (paymentChannels.find((c) => c === MOBILE_MONEY_CHANNEL) ??
              paymentChannels[0] ??
              'cash');

    const [channel, setChannel] = useState(initialChannel);
    const isMobileMoney = channel === MOBILE_MONEY_CHANNEL;
    const mmBlocked = isMobileMoney && mobileMoney && !mobileMoney.can_disburse;

    if (mobileMoneyOnly) {
        return (
            <div className="space-y-4 rounded-lg border border-dashed border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                    Send the approved principal to the borrower&apos;s phone via{' '}
                    <span className="font-medium text-foreground">
                        {mobileMoney?.driver_label ?? 'mobile money'}
                    </span>
                    .
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        id="disburse_phone"
                        label="Mobile money phone number"
                        error={errors.phone}
                        required
                        hint="Borrower wallet number (include country code)"
                    >
                        <Input
                            id="disburse_phone"
                            name="phone"
                            type="tel"
                            defaultValue={defaultPhone}
                            required
                            placeholder="256700000000"
                            aria-invalid={!!errors.phone}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="disburse_provider"
                        label="Network"
                        error={errors.provider}
                        required
                    >
                        <NativeSelect
                            id="disburse_provider"
                            name="provider"
                            defaultValue="mtn"
                            required
                            aria-invalid={!!errors.provider}
                        >
                            <option value="mtn">MTN</option>
                            <option value="airtel">Airtel</option>
                        </NativeSelect>
                    </FormField>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {mobileMoney?.uses_yo_payments && (
                <p className="text-sm text-muted-foreground">
                    {mobileMoney.can_disburse
                        ? 'Mobile money disbursements are sent through Yo! Payments (acwithdrawfunds).'
                        : 'Yo! Payments credentials are missing. Configure them in Platform settings or use cash/bank.'}
                </p>
            )}
            <div
                className={cn(
                    'grid gap-4',
                    isMobileMoney
                        ? 'sm:grid-cols-2 lg:grid-cols-3'
                        : 'max-w-md',
                )}
            >
                <FormField
                    id="channel"
                    label="Disbursement channel"
                    error={errors.channel}
                    required
                >
                    <NativeSelect
                        id="channel"
                        name="channel"
                        value={channel}
                        required
                        aria-invalid={!!errors.channel}
                        onChange={(event) => setChannel(event.target.value)}
                    >
                        {paymentChannels.map((paymentChannel) => (
                            <option
                                key={paymentChannel}
                                value={paymentChannel}
                            >
                                {mobileMoneyChannelLabel(
                                    paymentChannel,
                                    mobileMoney,
                                )}
                            </option>
                        ))}
                    </NativeSelect>
                </FormField>

                {isMobileMoney && (
                    <>
                        <FormField
                            id="phone"
                            label="Mobile money phone number"
                            error={errors.phone}
                            required
                            hint="Number that will receive the disbursement"
                        >
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={defaultPhone}
                                required
                                placeholder="256700000000"
                                aria-invalid={!!errors.phone}
                                className="h-10"
                            />
                        </FormField>
                        <FormField
                            id="provider"
                            label="Network"
                            error={errors.provider}
                            required
                        >
                            <NativeSelect
                                id="provider"
                                name="provider"
                                defaultValue="mtn"
                                required
                                aria-invalid={!!errors.provider}
                            >
                                <option value="mtn">MTN</option>
                                <option value="airtel">Airtel</option>
                            </NativeSelect>
                        </FormField>
                    </>
                )}
            </div>
            {mmBlocked && (
                <p className="text-sm text-destructive" role="alert">
                    Yo! Payments is not configured. Choose another channel or add
                    API credentials under Platform settings.
                </p>
            )}
        </div>
    );
}

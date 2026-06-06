import { FormField } from '@/components/form-field';
import { Label } from '@/components/ui/label';

type ChannelOption = {
    value: string;
    label: string;
};

export function PaymentReminderChannelsField({
    channels,
    selected,
    errors,
    hint = 'Choose how this client receives loan payment reminders.',
}: {
    channels: ChannelOption[];
    selected: string[];
    errors?: Record<string, string>;
    hint?: string;
}) {
    const fieldError =
        errors?.payment_reminder_channels ??
        errors?.['payment_reminder_channels.0'];

    return (
        <FormField
            id="payment_reminder_channels"
            label="Payment reminder channels"
            error={fieldError}
            hint={hint}
            required
        >
            <div className="space-y-3 rounded-lg border p-4">
                {channels.map((channel) => (
                    <div key={channel.value} className="flex items-start gap-3">
                        <input
                            type="hidden"
                            name={`payment_reminder_channels[${channel.value}]`}
                            value="0"
                        />
                        <input
                            type="checkbox"
                            id={`payment_reminder_channel_${channel.value}`}
                            name={`payment_reminder_channels[${channel.value}]`}
                            value="1"
                            defaultChecked={selected.includes(channel.value)}
                            className="mt-0.5 size-4 rounded border border-input"
                        />
                        <div className="grid gap-0.5">
                            <Label
                                htmlFor={`payment_reminder_channel_${channel.value}`}
                                className="leading-none font-medium"
                            >
                                {channel.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {channel.value === 'sms'
                                    ? 'Uses the phone number on this profile.'
                                    : 'Uses the email address on this profile.'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </FormField>
    );
}

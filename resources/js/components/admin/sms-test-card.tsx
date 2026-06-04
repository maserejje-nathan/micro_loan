import { Form } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { FormField } from '@/components/form-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type SmsDriverSummary = {
    driver: string;
    label: string;
    sends_real_sms: boolean;
};

export function SmsTestCard({
    testUrl,
    smsDriver,
}: {
    testUrl: string;
    smsDriver: SmsDriverSummary;
}) {
    return (
        <Card variant="muted" className="border-dashed">
            <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="size-5 text-primary" />
                        <CardTitle className="text-base">Send test SMS</CardTitle>
                    </div>
                    <Badge variant={smsDriver.sends_real_sms ? 'default' : 'secondary'}>
                        {smsDriver.label}
                    </Badge>
                </div>
                <CardDescription>
                    {smsDriver.sends_real_sms
                        ? 'Sends a real SMS using the active driver. Use a phone you can check.'
                        : 'Records a test message in the application log only — no SMS is delivered to the phone.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form action={testUrl} method="post" preserveScroll className="space-y-4">
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="test_sms_phone"
                                label="Recipient phone"
                                error={errors.phone}
                                required
                                hint="Include country code, e.g. 256700000001"
                            >
                                <Input
                                    id="test_sms_phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="256700000001"
                                    className="h-10"
                                    required
                                />
                            </FormField>
                            <FormField
                                id="test_sms_message"
                                label="Message (optional)"
                                error={errors.message}
                                hint="Leave blank for the default test message (max 160 characters)."
                            >
                                <Textarea
                                    id="test_sms_message"
                                    name="message"
                                    rows={2}
                                    maxLength={160}
                                    placeholder="Test SMS from your lending platform…"
                                />
                            </FormField>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Sending…' : 'Send test SMS'}
                            </Button>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

import { Form } from '@inertiajs/react';
import { Mail } from 'lucide-react';
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

type MailDriverSummary = {
    driver: string;
    label: string;
    sends_real_email: boolean;
};

export function EmailTestCard({
    testUrl,
    mailDriver,
    defaultEmail,
}: {
    testUrl: string;
    mailDriver: MailDriverSummary;
    defaultEmail?: string;
}) {
    return (
        <Card variant="muted" className="border-dashed">
            <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Mail className="size-5 text-primary" />
                        <CardTitle className="text-base">
                            Send test email
                        </CardTitle>
                    </div>
                    <Badge
                        variant={
                            mailDriver.sends_real_email
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {mailDriver.label}
                    </Badge>
                </div>
                <CardDescription>
                    {mailDriver.sends_real_email
                        ? 'Sends a real email using your SMTP server. Use an inbox you can check.'
                        : 'Writes the message to the application log only — no email is delivered.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form
                    action={testUrl}
                    method="post"
                    preserveScroll
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="test_email"
                                label="Recipient email"
                                error={errors.email}
                                required
                            >
                                <Input
                                    id="test_email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    defaultValue={defaultEmail}
                                    placeholder="you@example.com"
                                    className="h-10"
                                    required
                                />
                            </FormField>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Sending…' : 'Send test email'}
                            </Button>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

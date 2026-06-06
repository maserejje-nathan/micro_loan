import { Form, Head, usePage } from '@inertiajs/react';
import {
    testEmail,
    updateSmtp,
} from '@/actions/App/Http/Controllers/Admin/AdminPlatformSettingsController';
import { EmailTestCard } from '@/components/admin/email-test-card';
import { IntegrationApiResponse } from '@/components/admin/integration-api-response';
import { IntegrationStatusCard } from '@/components/admin/integration-status-card';
import { PlatformSettingsPage } from '@/components/admin/platform-settings-page';
import { FormActions } from '@/components/form-actions';
import { FormField } from '@/components/form-field';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
    index as settingsIndex,
    smtp as smtpRoutes,
} from '@/routes/admin/settings';

type SmtpSettings = {
    mail_driver: string;
    host: string;
    port: number;
    encryption: string;
    username: string;
    password: string;
    from_address: string;
    from_name: string;
    has_password: boolean;
};

export default function AdminSmtpSettings({
    settings,
    status,
    mailDriver,
    drivers,
    encryptionOptions,
}: {
    settings: SmtpSettings;
    status: {
        driver: string;
        configured: boolean;
        connected: boolean;
        message: string;
        host?: string;
        from_address?: string;
    };
    mailDriver: {
        driver: string;
        label: string;
        sends_real_email: boolean;
    };
    drivers: { value: string; label: string }[];
    encryptionOptions: { value: string; label: string }[];
}) {
    const { auth } = usePage().props as {
        auth?: { user?: { email?: string } };
    };

    return (
        <>
            <Head title="SMTP settings" />
            <PlatformSettingsPage
                title="Email (SMTP)"
                description="Configure how the platform sends email notifications and payment reminders."
            >
                <div className="space-y-4">
                    <IntegrationStatusCard
                        title="SMTP connection"
                        status={status}
                    />
                    <EmailTestCard
                        testUrl={testEmail.url()}
                        mailDriver={mailDriver}
                        defaultEmail={auth?.user?.email}
                    />
                    <IntegrationApiResponse label="Mail delivery details" />
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>SMTP server</CardTitle>
                        <CardDescription>
                            Leave password blank to keep the existing value. Use
                            log driver in development.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...updateSmtp.form()} className="space-y-6">
                            {({ processing, errors }) => (
                                <>
                                    <FormField
                                        id="mail_driver"
                                        label="Mail driver"
                                        error={errors.mail_driver}
                                        required
                                        hint="Log writes messages to storage/logs; SMTP sends real email."
                                    >
                                        <NativeSelect
                                            id="mail_driver"
                                            name="mail_driver"
                                            defaultValue={settings.mail_driver}
                                            required
                                        >
                                            {drivers.map((driver) => (
                                                <option
                                                    key={driver.value}
                                                    value={driver.value}
                                                >
                                                    {driver.label}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </FormField>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            id="host"
                                            label="SMTP host"
                                            error={errors.host}
                                        >
                                            <Input
                                                id="host"
                                                name="host"
                                                defaultValue={settings.host}
                                                placeholder="smtp.mailgun.org"
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField
                                            id="port"
                                            label="Port"
                                            error={errors.port}
                                        >
                                            <Input
                                                id="port"
                                                name="port"
                                                type="number"
                                                min={1}
                                                max={65535}
                                                defaultValue={settings.port}
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField
                                            id="encryption"
                                            label="Encryption"
                                            error={errors.encryption}
                                        >
                                            <NativeSelect
                                                id="encryption"
                                                name="encryption"
                                                defaultValue={settings.encryption}
                                            >
                                                {encryptionOptions.map((option) => (
                                                    <option
                                                        key={option.value || 'none'}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </FormField>
                                        <FormField
                                            id="username"
                                            label="Username"
                                            error={errors.username}
                                        >
                                            <Input
                                                id="username"
                                                name="username"
                                                defaultValue={settings.username}
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField
                                            id="password"
                                            label="Password"
                                            error={errors.password}
                                            hint={
                                                settings.has_password
                                                    ? 'Saved — leave blank to keep'
                                                    : undefined
                                            }
                                        >
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField
                                            id="from_address"
                                            label="From address"
                                            error={errors.from_address}
                                        >
                                            <Input
                                                id="from_address"
                                                name="from_address"
                                                type="email"
                                                defaultValue={settings.from_address}
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField
                                            id="from_name"
                                            label="From name"
                                            error={errors.from_name}
                                        >
                                            <Input
                                                id="from_name"
                                                name="from_name"
                                                defaultValue={settings.from_name}
                                                className="h-10"
                                            />
                                        </FormField>
                                    </div>

                                    <FormActions
                                        processing={processing}
                                        cancelHref={settingsIndex().url}
                                        submitLabel="Save SMTP settings"
                                    />
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </PlatformSettingsPage>
        </>
    );
}

AdminSmtpSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: settingsIndex().url },
        { title: 'Email (SMTP)', href: smtpRoutes().url },
    ],
};

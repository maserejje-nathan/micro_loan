import { Form, Head } from '@inertiajs/react';
import {
    testSms,
    updateAfricasTalking,
} from '@/actions/App/Http/Controllers/Admin/AdminPlatformSettingsController';
import { IntegrationApiResponse } from '@/components/admin/integration-api-response';
import { IntegrationStatusCard } from '@/components/admin/integration-status-card';
import { PlatformSettingsPage } from '@/components/admin/platform-settings-page';
import { SmsTestCard } from '@/components/admin/sms-test-card';
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
import {
    africasTalking as africasTalkingRoutes,
    index as settingsIndex,
} from '@/routes/admin/settings';

type AfricasTalkingSettings = {
    username: string;
    api_key: string;
    from: string;
    endpoint: string;
    has_api_key: boolean;
};

export default function AdminAfricasTalkingSettings({
    settings,
    status,
    smsDriver,
}: {
    settings: AfricasTalkingSettings;
    status: {
        driver: string;
        configured: boolean;
        connected: boolean;
        message: string;
    };
    smsDriver: {
        driver: string;
        label: string;
        sends_real_sms: boolean;
    };
}) {
    return (
        <>
            <Head title="Africa's Talking settings" />
            <PlatformSettingsPage
                title="Africa's Talking"
                description="SMS delivery for loan notifications. Set the SMS driver to Africa's Talking under Message types."
            >
                <div className="space-y-4">
                    <IntegrationStatusCard
                        title="Connection status"
                        status={status}
                        testUrl={africasTalkingRoutes.test.url()}
                    />
                    <SmsTestCard
                        testUrl={testSms.url()}
                        smsDriver={smsDriver}
                    />
                    <IntegrationApiResponse />
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>API credentials</CardTitle>
                        <CardDescription>
                            Leave API key blank to keep the existing value.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                <Form
                    {...updateAfricasTalking.form()}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
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
                                    id="api_key"
                                    label="API key"
                                    error={errors.api_key}
                                    hint={
                                        settings.has_api_key
                                            ? 'Saved — leave blank to keep'
                                            : undefined
                                    }
                                >
                                    <Input
                                        id="api_key"
                                        name="api_key"
                                        type="password"
                                        autoComplete="new-password"
                                        className="h-10"
                                    />
                                </FormField>
                                <FormField
                                    id="from"
                                    label="Sender ID / From"
                                    error={errors.from}
                                >
                                    <Input
                                        id="from"
                                        name="from"
                                        defaultValue={settings.from}
                                        className="h-10"
                                    />
                                </FormField>
                                <FormField
                                    id="endpoint"
                                    label="Messaging endpoint"
                                    error={errors.endpoint}
                                >
                                    <Input
                                        id="endpoint"
                                        name="endpoint"
                                        defaultValue={settings.endpoint}
                                        className="h-10"
                                    />
                                </FormField>
                            </div>

                            <FormActions
                                processing={processing}
                                cancelHref={settingsIndex().url}
                                submitLabel="Save Africa's Talking settings"
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

AdminAfricasTalkingSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: settingsIndex().url },
        { title: "Africa's Talking", href: africasTalkingRoutes().url },
    ],
};

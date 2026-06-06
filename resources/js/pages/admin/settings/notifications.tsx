import { Form, Head } from '@inertiajs/react';
import {
    testSms,
    updateNotifications,
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
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    africasTalking as africasTalkingRoutes,
    index as settingsIndex,
    notifications as notificationsRoute,
} from '@/routes/admin/settings';

type NotificationType = {
    key: string;
    label: string;
    enabled: boolean;
};

export default function AdminNotificationSettings({
    settings,
    types,
    smsDrivers,
    africasTalkingStatus,
    smsDriver,
}: {
    settings: { sms_driver: string };
    types: NotificationType[];
    smsDrivers: { value: string; label: string }[];
    africasTalkingStatus: {
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
            <Head title="Notification settings" />
            <PlatformSettingsPage
                title="Message types"
                description="Choose the SMS provider and which automated messages are sent to borrowers. Configure email delivery under Email (SMTP) in the sidebar."
            >
                <div className="space-y-4">
                    <IntegrationStatusCard
                        title="Africa's Talking"
                        status={africasTalkingStatus}
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
                        <CardTitle>SMS notifications</CardTitle>
                        <CardDescription>
                            Disabled types are skipped even when the underlying
                            event occurs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...updateNotifications.form()}
                            className="space-y-8"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <FormField
                                        id="sms_driver"
                                        label="SMS driver"
                                        error={errors.sms_driver}
                                        required
                                        hint="Use log in development; Africa's Talking sends real SMS when configured."
                                    >
                                        <NativeSelect
                                            id="sms_driver"
                                            name="sms_driver"
                                            defaultValue={settings.sms_driver}
                                            required
                                        >
                                            {smsDrivers.map((driver) => (
                                                <option
                                                    key={driver.value}
                                                    value={driver.value}
                                                >
                                                    {driver.label}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </FormField>

                                    <div className="space-y-4">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Automated message types
                                        </p>
                                        <div className="space-y-3 rounded-lg border p-4">
                                            {types.map((type) => (
                                                <div
                                                    key={type.key}
                                                    className="flex items-start gap-3"
                                                >
                                                    <input
                                                        type="hidden"
                                                        name={`enabled_types[${type.key}]`}
                                                        value="0"
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        id={`type_${type.key}`}
                                                        name={`enabled_types[${type.key}]`}
                                                        value="1"
                                                        defaultChecked={
                                                            type.enabled
                                                        }
                                                        className="size-4 rounded border border-input"
                                                    />
                                                    <div className="grid gap-1">
                                                        <Label
                                                            htmlFor={`type_${type.key}`}
                                                            className="leading-none font-medium"
                                                        >
                                                            {type.label}
                                                        </Label>
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            {type.key}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <FormActions
                                        processing={processing}
                                        cancelHref={settingsIndex().url}
                                        submitLabel="Save notification settings"
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

AdminNotificationSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: settingsIndex().url },
        { title: 'Message types', href: notificationsRoute().url },
    ],
};

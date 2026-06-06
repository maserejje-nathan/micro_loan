import { Form, Head } from '@inertiajs/react';
import { updateYoPayments } from '@/actions/App/Http/Controllers/Admin/AdminPlatformSettingsController';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    index as settingsIndex,
    yoPayments as yoPaymentsRoutes,
} from '@/routes/admin/settings';

type YoSettings = {
    mobile_money_driver: string;
    username: string;
    password: string;
    account: string;
    sandbox: boolean;
    non_blocking: boolean;
    api_url: string;
    sandbox_api_url: string;
    has_password: boolean;
};

export default function AdminYoPaymentsSettings({
    settings,
    status,
    drivers,
}: {
    settings: YoSettings;
    status: {
        driver: string;
        configured: boolean;
        sandbox: boolean;
        api_url: string;
        connected: boolean;
        message: string;
    };
    drivers: { value: string; label: string }[];
}) {
    return (
        <>
            <Head title="Yo! Payments settings" />
            <PlatformSettingsPage
                title="Yo! Payments"
                description="Mobile money disbursement and collection via Yo! Payments API."
            >
                <div className="mb-4">
                    <IntegrationStatusCard
                        title="Connection status"
                        status={status}
                        testUrl={yoPaymentsRoutes.test.url()}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Credentials & driver</CardTitle>
                        <CardDescription>
                            Leave password blank to keep the existing value.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                <Form {...updateYoPayments.form()} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="mobile_money_driver"
                                label="Mobile money driver"
                                error={errors.mobile_money_driver}
                                required
                            >
                                <NativeSelect
                                    id="mobile_money_driver"
                                    name="mobile_money_driver"
                                    defaultValue={settings.mobile_money_driver}
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
                                    id="username"
                                    label="API username"
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
                                    label="API password"
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
                                    id="account"
                                    label="Account / phone"
                                    error={errors.account}
                                >
                                    <Input
                                        id="account"
                                        name="account"
                                        defaultValue={settings.account}
                                        className="h-10"
                                    />
                                </FormField>
                            </div>

                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="sandbox"
                                        name="sandbox"
                                        value="1"
                                        defaultChecked={settings.sandbox}
                                    />
                                    <Label htmlFor="sandbox">Sandbox mode</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="non_blocking"
                                        name="non_blocking"
                                        value="1"
                                        defaultChecked={settings.non_blocking}
                                    />
                                    <Label htmlFor="non_blocking">
                                        Non-blocking requests
                                    </Label>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id="api_url"
                                    label="Production API URL"
                                    error={errors.api_url}
                                >
                                    <Input
                                        id="api_url"
                                        name="api_url"
                                        defaultValue={settings.api_url}
                                        className="h-10"
                                    />
                                </FormField>
                                <FormField
                                    id="sandbox_api_url"
                                    label="Sandbox API URL"
                                    error={errors.sandbox_api_url}
                                >
                                    <Input
                                        id="sandbox_api_url"
                                        name="sandbox_api_url"
                                        defaultValue={settings.sandbox_api_url}
                                        className="h-10"
                                    />
                                </FormField>
                            </div>

                            <FormActions
                                processing={processing}
                                cancelHref={settingsIndex().url}
                                submitLabel="Save Yo! Payments settings"
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

AdminYoPaymentsSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: settingsIndex().url },
        { title: 'Yo! Payments', href: yoPaymentsRoutes().url },
    ],
};

import { Form, Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { FormField } from '@/components/form-field';
import {
    SettingsPageHeader,
    SettingsSection,
} from '@/components/settings/settings-section';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { edit, update } from '@/routes/settings/portal';

type PortalSettings = {
    enabled: boolean;
    allow_applications: boolean;
    allow_self_registration: boolean;
    welcome_message: string;
};

const onOffOptions = [
    { value: '1', label: 'On' },
    { value: '0', label: 'Off' },
];

const yesNoOptions = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' },
];

export default function PortalSettingsPage({
    portal,
    portalLoginUrl,
    portalRegisterUrl,
    organization,
}: {
    portal: PortalSettings;
    portalLoginUrl: string;
    portalRegisterUrl: string | null;
    organization: { name: string; slug: string };
}) {
    return (
        <>
            <Head title="Client portal" />

            <SettingsPageHeader
                title="Client portal"
                description="Let borrowers sign in to view loans, apply online, and update their profile."
            />

            {portal.enabled && portalLoginUrl && (
                <SettingsSection
                    title="Share links"
                    description="Send these URLs to customers who need portal access."
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="font-medium">
                                    Portal sign-in URL
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Share this link with customers who have
                                    portal access.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={portalLoginUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="mr-2 size-4" />
                                    Open portal
                                </a>
                            </Button>
                        </div>
                        {portalRegisterUrl && (
                            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                                <div>
                                    <p className="font-medium">
                                        Self-registration URL
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        New customers can create an account at
                                        this link.
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={portalRegisterUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink className="mr-2 size-4" />
                                        Open registration
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </SettingsSection>
            )}

            <SettingsSection
                title="Configuration"
                description={`Portal for ${organization.name}`}
            >
                <Form
                    {...update.form()}
                    disableWhileProcessing
                    className="flex max-w-2xl flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="enabled"
                                label="Enable client portal"
                                error={errors.enabled}
                                hint="When off, customers cannot sign in even if individually enabled."
                            >
                                <NativeSelect
                                    id="enabled"
                                    name="enabled"
                                    defaultValue={portal.enabled ? '1' : '0'}
                                    options={onOffOptions}
                                    aria-invalid={!!errors.enabled}
                                />
                            </FormField>

                            <FormField
                                id="allow_self_registration"
                                label="Allow self-registration"
                                error={errors.allow_self_registration}
                                hint="New customers can create their own portal account and enter their details."
                            >
                                <NativeSelect
                                    id="allow_self_registration"
                                    name="allow_self_registration"
                                    defaultValue={
                                        portal.allow_self_registration
                                            ? '1'
                                            : '0'
                                    }
                                    options={yesNoOptions}
                                    aria-invalid={
                                        !!errors.allow_self_registration
                                    }
                                />
                            </FormField>

                            <FormField
                                id="allow_applications"
                                label="Allow online applications"
                                error={errors.allow_applications}
                                hint="Customers can submit new loan applications from the portal."
                            >
                                <NativeSelect
                                    id="allow_applications"
                                    name="allow_applications"
                                    defaultValue={
                                        portal.allow_applications ? '1' : '0'
                                    }
                                    options={yesNoOptions}
                                    aria-invalid={!!errors.allow_applications}
                                />
                            </FormField>

                            <FormField
                                id="welcome_message"
                                label="Welcome message"
                                error={errors.welcome_message}
                                hint="Optional message shown on the customer dashboard."
                            >
                                <Textarea
                                    id="welcome_message"
                                    name="welcome_message"
                                    rows={3}
                                    defaultValue={portal.welcome_message}
                                    placeholder="Welcome to your loan portal…"
                                    aria-invalid={!!errors.welcome_message}
                                />
                            </FormField>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-36"
                                >
                                    {processing && <Spinner />}
                                    Save settings
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsSection>
        </>
    );
}

PortalSettingsPage.layout = {
    breadcrumbs: [{ title: 'Client portal', href: edit().url }],
};

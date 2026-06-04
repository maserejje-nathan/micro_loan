import { Form, Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type PortalSettings = {
    enabled: boolean;
    allow_applications: boolean;
    allow_self_registration: boolean;
    welcome_message: string;
};

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
            <div className="space-y-6">
                <Heading
                    title="Client portal"
                    description="Let borrowers sign in to view loans, apply online, and update their profile."
                />

                {portal.enabled && portalLoginUrl && (
                    <Card>
                        <CardContent className="flex flex-col gap-4 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium">Portal sign-in URL</p>
                                    <p className="text-sm text-muted-foreground">
                                        Share this link with customers who have portal
                                        access.
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
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-base">Configuration</CardTitle>
                        <CardDescription>
                            Portal for {organization.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form
                            action="/settings/portal"
                            method="put"
                            className="flex max-w-lg flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                        <div>
                                            <Label htmlFor="enabled">
                                                Enable client portal
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                When off, customers cannot sign
                                                in even if individually enabled.
                                            </p>
                                        </div>
                                        <select
                                            id="enabled"
                                            name="enabled"
                                            defaultValue={
                                                portal.enabled ? '1' : '0'
                                            }
                                            className="h-10 rounded-md border px-3 text-sm"
                                        >
                                            <option value="1">On</option>
                                            <option value="0">Off</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                        <div>
                                            <Label htmlFor="allow_self_registration">
                                                Allow self-registration
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                New customers can create their own
                                                portal account and enter their details.
                                            </p>
                                        </div>
                                        <select
                                            id="allow_self_registration"
                                            name="allow_self_registration"
                                            defaultValue={
                                                portal.allow_self_registration
                                                    ? '1'
                                                    : '0'
                                            }
                                            className="h-10 rounded-md border px-3 text-sm"
                                        >
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                        <div>
                                            <Label htmlFor="allow_applications">
                                                Allow online applications
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Customers can submit new loan
                                                applications from the portal.
                                            </p>
                                        </div>
                                        <select
                                            id="allow_applications"
                                            name="allow_applications"
                                            defaultValue={
                                                portal.allow_applications
                                                    ? '1'
                                                    : '0'
                                            }
                                            className="h-10 rounded-md border px-3 text-sm"
                                        >
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="welcome_message">
                                            Welcome message
                                        </Label>
                                        <Textarea
                                            id="welcome_message"
                                            name="welcome_message"
                                            rows={3}
                                            defaultValue={portal.welcome_message}
                                            placeholder="Optional message on the customer dashboard"
                                        />
                                        {errors.welcome_message && (
                                            <p className="text-sm text-destructive">
                                                {errors.welcome_message}
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        Save settings
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
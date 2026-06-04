import { Form, Head } from '@inertiajs/react';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/settings/team';

type Invitation = {
    id: number;
    email: string;
    role: string;
    invited_by: string;
    expires_at: string;
    accepted_at: string | null;
    status: string;
};

type Role = { id: number; name: string; slug: string };

export default function TeamSettings({
    invitations,
    roles,
    tenantUrl,
}: {
    invitations: Invitation[];
    roles: Role[];
    tenantUrl: string | null;
}) {
    return (
        <>
            <Head title="Team" />
            <div className="space-y-6">
                {tenantUrl && (
                    <p className="text-sm text-muted-foreground">
                        Your workspace URL:{' '}
                        <a
                            href={tenantUrl}
                            className="font-medium underline underline-offset-4"
                        >
                            {tenantUrl}
                        </a>
                    </p>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Invite team member</CardTitle>
                        <CardDescription>
                            They will receive an email with a link to join your
                            organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...store.form()}
                            disableWhileProcessing
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <FormField
                                        id="email"
                                        label="Email address"
                                        error={errors.email}
                                        required
                                    >
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="colleague@company.com"
                                            aria-invalid={!!errors.email}
                                            className="h-10"
                                        />
                                    </FormField>
                                    <FormField
                                        id="role_id"
                                        label="Role"
                                        error={errors.role_id}
                                        required
                                        hint="Controls what they can access"
                                    >
                                        <NativeSelect
                                            id="role_id"
                                            name="role_id"
                                            required
                                            defaultValue={
                                                roles[0]?.id?.toString() ?? ''
                                            }
                                            aria-invalid={!!errors.role_id}
                                        >
                                            {roles.map((role) => (
                                                <option
                                                    key={role.id}
                                                    value={role.id}
                                                >
                                                    {role.name}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </FormField>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Send invitation
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending & recent invitations</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y text-sm">
                        {invitations.length === 0 && (
                            <p className="py-2 text-muted-foreground">
                                No invitations yet.
                            </p>
                        )}
                        {invitations.map((inv) => (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between gap-4 py-3"
                            >
                                <div>
                                    <p className="font-medium">{inv.email}</p>
                                    <p className="text-muted-foreground">
                                        {inv.role} · {inv.status}
                                    </p>
                                </div>
                                {inv.status === 'pending' && (
                                    <Form
                                        action={`/settings/team/${inv.id}`}
                                        method="delete"
                                    >
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            size="sm"
                                        >
                                            Revoke
                                        </Button>
                                    </Form>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

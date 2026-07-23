import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { accept } from '@/routes/invitations';

type Invitation = {
    token: string;
    email: string;
    organization_name: string;
    role_name: string;
    expires_at: string;
};

export default function AcceptInvitation({
    invitation,
}: {
    invitation: Invitation;
}) {
    return (
        <>
            <Head title="Accept invitation" />
            <div className="w-full space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Join {invitation.organization_name}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You have been invited as{' '}
                        <strong>{invitation.role_name}</strong>. Sign in as{' '}
                        <strong>{invitation.email}</strong> to accept. Expires{' '}
                        {invitation.expires_at}.
                    </p>
                </div>
                <Form
                    {...accept.form(invitation.token)}
                    disableWhileProcessing
                >
                    {({ processing, errors }) => (
                        <div className="space-y-3">
                            {errors.token && (
                                <p className="text-sm text-destructive">
                                    {errors.token}
                                </p>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Accept invitation
                            </Button>
                        </div>
                    )}
                </Form>
                <p className="text-center text-sm text-muted-foreground">
                    <Link href={login()} className="underline">
                        Sign in first
                    </Link>
                </p>
            </div>
        </>
    );
}

AcceptInvitation.layout = {
    title: 'Team invitation',
    description: 'Accept your invitation to join a lending workspace.',
};

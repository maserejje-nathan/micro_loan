import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';

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
            <div className="w-full space-y-6 p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
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
                    action={`/invitations/${invitation.token}/accept`}
                    method="post"
                >
                    <Button type="submit" className="w-full">
                        Accept invitation
                    </Button>
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

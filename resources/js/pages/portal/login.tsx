import { Form, Head, Link } from '@inertiajs/react';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    organization: { name: string; slug: string } | null;
    requiresOrganizationSlug: boolean;
    portalLoginUrl: string | null;
    allowSelfRegistration: boolean;
    portalRegisterUrl: string | null;
};

export default function PortalLogin({
    organization,
    requiresOrganizationSlug,
    allowSelfRegistration,
    portalRegisterUrl,
}: Props) {
    return (
        <>
            <Head title="Client portal sign in" />

            <Form
                action="/portal/login"
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {requiresOrganizationSlug && (
                            <div className="grid gap-2">
                                <Label htmlFor="organization_slug">
                                    Lender code
                                </Label>
                                <Input
                                    id="organization_slug"
                                    name="organization_slug"
                                    placeholder="your-company-slug"
                                    defaultValue={organization?.slug}
                                    required
                                />
                                {errors.organization_slug && (
                                    <p className="text-sm text-destructive">
                                        {errors.organization_slug}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoFocus
                                required
                                placeholder="2567XXXXXXXX"
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" name="remember" value="1" />
                            <Label htmlFor="remember" className="font-normal">
                                Remember me
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            Sign in
                        </Button>

                        {allowSelfRegistration && (
                            <p className="text-center text-sm text-muted-foreground">
                                New customer?{' '}
                                <Link
                                    href={portalRegisterUrl ?? '/portal/register'}
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    Create an account
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

PortalLogin.layout = (props: Props) => ({
    title: 'Sign in',
    description:
        'Use the phone number and password your lender gave you to access your account.',
    organizationName: props.organization?.name,
});

import { Form, Head, Link } from '@inertiajs/react';
import { FormField } from '@/components/form-field';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/portal/login';

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
                {...store.form()}
                resetOnSuccess={['password']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {requiresOrganizationSlug && (
                            <FormField
                                id="organization_slug"
                                label="Lender code"
                                error={errors.organization_slug}
                                required
                                hint="The code your lender shared for portal access."
                            >
                                <Input
                                    id="organization_slug"
                                    name="organization_slug"
                                    placeholder="your-company-slug"
                                    defaultValue={organization?.slug}
                                    required
                                    className="h-10"
                                    aria-invalid={!!errors.organization_slug}
                                />
                            </FormField>
                        )}

                        <FormField
                            id="phone"
                            label="Phone number"
                            error={errors.phone}
                            required
                        >
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoFocus
                                required
                                placeholder="2567XXXXXXXX"
                                className="h-10"
                                aria-invalid={!!errors.phone}
                            />
                        </FormField>

                        <FormField
                            id="password"
                            label="Password"
                            error={errors.password}
                            required
                        >
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                className="h-10"
                                aria-invalid={!!errors.password}
                            />
                        </FormField>

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
                            {processing && <Spinner />}
                            Sign in
                        </Button>

                        {allowSelfRegistration && (
                            <p className="text-center text-sm text-muted-foreground">
                                New customer?{' '}
                                <Link
                                    href={
                                        portalRegisterUrl ?? '/portal/register'
                                    }
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

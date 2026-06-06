import { Form, Head } from '@inertiajs/react';
import { AuthFormField } from '@/components/auth-form-field';
import PasswordInput from '@/components/password-input';
import { PasswordRequirements } from '@/components/password-requirements';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Create account" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="space-y-4">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Your profile
                                </p>
                                <AuthFormField
                                    id="name"
                                    label="Full name"
                                    error={errors.name}
                                    required
                                >
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Jane Namukasa"
                                        aria-invalid={!!errors.name}
                                        className="h-10"
                                    />
                                </AuthFormField>

                                <AuthFormField
                                    id="email"
                                    label="Work email"
                                    error={errors.email}
                                    required
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="you@yourcompany.com"
                                        aria-invalid={!!errors.email}
                                        className="h-10"
                                    />
                                </AuthFormField>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Company workspace
                                </p>
                                <AuthFormField
                                    id="company_name"
                                    label="Lending company name"
                                    error={errors.company_name}
                                    hint="Optional now — you can set this on the next screen if you leave it blank."
                                >
                                    <Input
                                        id="company_name"
                                        type="text"
                                        tabIndex={3}
                                        name="company_name"
                                        placeholder="e.g. Kampala Micro Loans"
                                        aria-invalid={!!errors.company_name}
                                        aria-describedby="company_name-hint"
                                        className="h-10"
                                    />
                                </AuthFormField>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Security
                                </p>
                                <AuthFormField
                                    id="password"
                                    label="Password"
                                    error={errors.password}
                                    required
                                >
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a password"
                                        passwordrules={passwordRules}
                                        aria-invalid={!!errors.password}
                                        className="h-10"
                                    />
                                    {!errors.password && (
                                        <PasswordRequirements
                                            rules={passwordRules}
                                        />
                                    )}
                                </AuthFormField>

                                <AuthFormField
                                    id="password_confirmation"
                                    label="Confirm password"
                                    error={errors.password_confirmation}
                                    required
                                >
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Repeat your password"
                                        passwordrules={passwordRules}
                                        aria-invalid={
                                            !!errors.password_confirmation
                                        }
                                        className="h-10"
                                    />
                                </AuthFormField>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="h-10 w-full"
                            tabIndex={6}
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            Create account
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={7}>
                                Sign in
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Start your workspace',
    description:
        'Register as the owner of your lending company. You can invite your team after setup.',
    size: 'lg',
};

import { Form, Head } from '@inertiajs/react';
import { AuthFormField } from '@/components/auth-form-field';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <AuthFormField
                            id="email"
                            label="Email"
                            error={errors.email}
                        >
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="h-10"
                                readOnly
                            />
                        </AuthFormField>

                        <AuthFormField
                            id="password"
                            label="Password"
                            error={errors.password}
                            required
                        >
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="h-10"
                                autoFocus
                                placeholder="Password"
                                passwordrules={passwordRules}
                                aria-invalid={!!errors.password}
                            />
                        </AuthFormField>

                        <AuthFormField
                            id="password_confirmation"
                            label="Confirm password"
                            error={errors.password_confirmation}
                            required
                        >
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="h-10"
                                placeholder="Confirm password"
                                passwordrules={passwordRules}
                                aria-invalid={!!errors.password_confirmation}
                            />
                        </AuthFormField>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Reset password
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};

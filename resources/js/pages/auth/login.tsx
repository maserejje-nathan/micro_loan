import { Form, Head } from '@inertiajs/react';
import { AuthFormField } from '@/components/auth-form-field';
import { AuthStatusAlert } from '@/components/auth-status-alert';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <div className="flex flex-col gap-6">
                {status && (
                    <AuthStatusAlert message={status} variant="success" />
                )}

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <AuthFormField
                                    id="email"
                                    label="Email address"
                                    error={errors.email}
                                    required
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        aria-invalid={!!errors.email}
                                        className="h-10"
                                    />
                                </AuthFormField>

                                <AuthFormField
                                    id="password"
                                    label="Password"
                                    error={errors.password}
                                    required
                                    labelAction={
                                        canResetPassword ? (
                                            <TextLink
                                                href={request()}
                                                className="text-xs font-normal"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        ) : undefined
                                    }
                                >
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        aria-invalid={!!errors.password}
                                        className="h-10"
                                    />
                                </AuthFormField>

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer font-normal"
                                    >
                                        Keep me signed in
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="h-10 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Sign in
                            </Button>

                            <div className="relative">
                                <Separator />
                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                                    New here?
                                </span>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                Create a workspace for your lending company.{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up free
                                </TextLink>
                            </p>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to manage loans, customers, and repayments.',
};

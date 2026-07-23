import { Form, Head } from '@inertiajs/react';
import { AuthFormField } from '@/components/auth-form-field';
import { AuthStatusAlert } from '@/components/auth-status-alert';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                {status ? (
                    <AuthStatusAlert message={status} variant="success" />
                ) : null}

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    disableWhileProcessing
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <AuthFormField
                                id="email"
                                label="Work email"
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
                                    className="h-12 rounded-none border-[#D8DFD9] bg-white text-base shadow-none focus-visible:border-[#1F6B57] focus-visible:ring-[#1F6B57]/25"
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
                                            className="text-xs font-medium text-[#1F6B57]"
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
                                    className="h-12 rounded-none border-[#D8DFD9] bg-white text-base shadow-none focus-visible:border-[#1F6B57] focus-visible:ring-[#1F6B57]/25"
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
                                    className="cursor-pointer font-normal text-[#24342E]"
                                >
                                    Keep me signed in
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 h-12 w-full rounded-none bg-[#1F6B57] text-base font-semibold text-white hover:bg-[#195A49]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Sign in
                            </Button>

                            <div className="space-y-3 pt-1 text-center">
                                <p className="text-sm text-[#5C6B64]">
                                    Create a workspace for your lending
                                    company.{' '}
                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="font-semibold text-[#1F6B57]"
                                    >
                                        Sign up free
                                    </TextLink>
                                </p>
                                <p className="text-xs leading-5 text-[#7A8A82]">
                                    Need borrower access instead? Customers
                                    should sign in through your client portal.
                                </p>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description:
        'Sign in with your lender or platform admin account to continue.',
};

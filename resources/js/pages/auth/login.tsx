import { Form, Head } from '@inertiajs/react';
import { Building2, FileText, ShieldCheck, Smartphone } from 'lucide-react';
import { AuthFormField } from '@/components/auth-form-field';
import { AuthStatusAlert } from '@/components/auth-status-alert';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
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

                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Lender access
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Sign in to manage customers, review applications,
                            disburse loans, and track repayments in Avango
                            Credit Platform.
                        </p>
                    </div>

                    <Card className="border-primary/15 bg-primary/5 shadow-none">
                        <CardContent className="grid gap-3 px-4 py-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <Building2 className="size-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Built for lending teams
                                    </p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Access your borrower directory, loan
                                        products, active loans, and team tools
                                        from one secure workspace.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg border bg-background/80 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <ShieldCheck className="size-4 text-primary" />
                                        Secure sign-in
                                    </div>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Protected access for owners, loan
                                        officers, and cashiers.
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-background/80 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <Smartphone className="size-4 text-primary" />
                                        Collections ready
                                    </div>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Stay on top of repayments, reminders,
                                        and supported mobile money workflows.
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-background/80 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <FileText className="size-4 text-primary" />
                                        Portfolio visibility
                                    </div>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Review applications, statements, and
                                        lending activity in one place.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Sign in details
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Use the email and password for your
                                        team account.
                                    </p>
                                </div>

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

                            <div className="space-y-3 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Create a workspace for your lending
                                    company.{' '}
                                    <TextLink href={register()} tabIndex={5}>
                                        Sign up free
                                    </TextLink>
                                </p>
                                <p className="text-xs text-muted-foreground">
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
        'Sign in to run your lending operation in Avango Credit Platform.',
};

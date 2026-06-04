import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Building2,
    Check,
    CreditCard,
    FileText,
    Mail,
    Shield,
    Smartphone,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import {
    WelcomeBannerSlider,
    type WelcomeBannerSlide,
} from '@/components/welcome-banner-slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    LoanCalculatorWidget,
    type LoanCalculatorConfig,
} from '@/components/loan-calculator/loan-calculator-widget';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

const stepIcons = [UserPlus, Building2, Mail, Users];

const featureAccents = [
    {
        icon: 'bg-chart-2/20 text-chart-2 ring-chart-2/25',
        card: 'hover:border-chart-2/50 hover:shadow-chart-2/10',
        dot: 'bg-chart-2',
    },
    {
        icon: 'bg-chart-3/20 text-chart-3 ring-chart-3/25',
        card: 'hover:border-chart-3/50 hover:shadow-chart-3/10',
        dot: 'bg-chart-3',
    },
    {
        icon: 'bg-chart-1/20 text-chart-1 ring-chart-1/25',
        card: 'hover:border-chart-1/50 hover:shadow-chart-1/10',
        dot: 'bg-chart-1',
    },
    {
        icon: 'bg-chart-4/20 text-chart-4 ring-chart-4/25',
        card: 'hover:border-chart-4/50 hover:shadow-chart-4/10',
        dot: 'bg-chart-4',
    },
    {
        icon: 'bg-chart-5/20 text-chart-5 ring-chart-5/25',
        card: 'hover:border-chart-5/50 hover:shadow-chart-5/10',
        dot: 'bg-chart-5',
    },
    {
        icon: 'bg-chart-2/20 text-chart-2 ring-chart-2/25',
        card: 'hover:border-chart-2/50 hover:shadow-chart-2/10',
        dot: 'bg-chart-2',
    },
] as const;

const featureIcons = [
    Users,
    Wallet,
    Smartphone,
    BarChart3,
    FileText,
    Shield,
];

const stepAccents = [
    'from-chart-2 to-chart-3',
    'from-chart-3 to-chart-1',
    'from-chart-1 to-chart-4',
    'from-chart-4 to-chart-5',
] as const;

const planAccents: Record<string, { border: string; badge: string; glow: string }> = {
    starter: {
        border: 'border-t-chart-4',
        badge: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
        glow: 'shadow-chart-4/15',
    },
    professional: {
        border: 'border-t-chart-2',
        badge: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
        glow: 'shadow-chart-2/25',
    },
    enterprise: {
        border: 'border-t-chart-3',
        badge: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
        glow: 'shadow-chart-3/15',
    },
};

const defaultPlanAccent = {
    border: 'border-t-chart-2',
    badge: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
    glow: 'shadow-chart-2/15',
};

type WelcomeContent = {
    meta_title: string;
    hero_badge: string;
    hero_headline_prefix: string;
    hero_headline_highlight: string;
    hero_description: string;
    hero_primary_cta: string;
    hero_secondary_cta: string;
    highlights: string[];
    cta_title: string;
    cta_description: string;
    footer_tagline: string;
    popular_plan_slug: string;
    banner_slides: WelcomeBannerSlide[];
    steps: Array<{ title: string; description: string }>;
    features: Array<{ title: string; description: string }>;
};

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    currency: string;
    billing_interval: string;
    trial_days: number;
    max_users: number | null;
    max_customers: number | null;
    max_active_loans: number | null;
    features: string[];
};

type SubscriptionDetails = {
    status: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
    plan: Plan;
    usage: { users: number; customers: number; active_loans: number };
};

function formatLimit(value: number | null): string {
    return value === null ? 'Unlimited' : value.toLocaleString();
}

function formatDateTime(value: string): string {
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
}

export default function Welcome({
    content,
    plans,
    subscription,
    loanCalculator,
}: {
    content: WelcomeContent;
    plans: Plan[];
    subscription: SubscriptionDetails | null;
    loanCalculator: LoanCalculatorConfig;
}) {
    const { auth, name } = usePage<{
        auth: { user?: unknown };
        name: string;
    }>().props;

    const popularPlanSlug = content.popular_plan_slug || 'professional';
    const steps = content.steps.map((step, index) => ({
        ...step,
        number: index + 1,
        icon: stepIcons[index] ?? UserPlus,
    }));
    const platformFeatures = content.features.map((feature, index) => ({
        ...feature,
        icon: featureIcons[index] ?? Users,
    }));

    return (
        <>
            <Head title={content.meta_title} />
            <div className="welcome-page min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-50 border-b border-chart-2/20 bg-background/75 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 transition-opacity hover:opacity-80"
                        >
                            <AppLogo />
                        </Link>
                        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                            <a
                                href="#calculator"
                                className="transition-colors hover:text-chart-4"
                            >
                                Calculator
                            </a>
                            <a
                                href="#features"
                                className="transition-colors hover:text-chart-2"
                            >
                                Features
                            </a>
                            {plans.length > 0 && (
                                <a
                                    href="#pricing"
                                    className="transition-colors hover:text-chart-3"
                                >
                                    Pricing
                                </a>
                            )}
                            <a
                                href="#how-it-works"
                                className="transition-colors hover:text-chart-1"
                            >
                                How it works
                            </a>
                        </nav>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-chart-3 to-chart-2 text-white shadow-md shadow-chart-3/25 border-0 hover:opacity-95"
                                >
                                    <Link href={dashboard()}>
                                        Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="hidden sm:inline-flex"
                                        asChild
                                    >
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        className="bg-gradient-to-r from-chart-2 to-chart-3 text-white shadow-md shadow-chart-2/30 hover:opacity-95 border-0"
                                    >
                                        <Link href={register()}>
                                            Get started
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {content.banner_slides.length > 0 && (
                    <WelcomeBannerSlider slides={content.banner_slides} />
                )}

                <main>
                    <section className="welcome-hero-bg relative overflow-hidden border-b border-chart-2/15">
                        <div
                            className="pointer-events-none absolute -left-20 top-20 size-72 rounded-full bg-chart-2/30 blur-3xl"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute -right-16 top-10 size-80 rounded-full bg-chart-3/25 blur-3xl"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-chart-4/20 blur-3xl"
                            aria-hidden
                        />

                        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
                            <div className="max-w-3xl">
                                <Badge
                                    variant="outline"
                                    className="mb-6 rounded-full border-chart-2/40 bg-chart-2/10 px-3 py-1 text-xs font-medium text-chart-2"
                                >
                                    {content.hero_badge}
                                </Badge>
                                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                    {content.hero_headline_prefix}{' '}
                                    <span className="bg-gradient-to-r from-chart-2 via-chart-3 to-chart-1 bg-clip-text text-transparent">
                                        {content.hero_headline_highlight}
                                    </span>
                                </h1>
                                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
                                    {content.hero_description}
                                </p>

                                {!auth.user && (
                                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <Button
                                            size="lg"
                                            asChild
                                            className="bg-gradient-to-r from-chart-2 to-chart-3 text-white shadow-lg shadow-chart-2/35 hover:opacity-95 border-0"
                                        >
                                            <Link href={register()}>
                                                {content.hero_primary_cta}
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="border-chart-3/40 bg-background/60 hover:bg-chart-3/10 hover:text-chart-3"
                                            asChild
                                        >
                                            <Link href={login()}>
                                                {content.hero_secondary_cta}
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                    {content.highlights.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="size-4 shrink-0 text-chart-2" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {auth.user && subscription && (
                        <section className="border-b border-chart-3/15 bg-gradient-to-r from-chart-2/5 via-chart-3/5 to-chart-1/5">
                            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                                <Card className="overflow-hidden border-chart-2/25 shadow-lg shadow-chart-2/10">
                                    <div className="flex flex-col gap-6 border-b border-chart-2/15 bg-gradient-to-r from-chart-2/10 to-chart-3/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-chart-2 to-chart-3 text-white shadow-md">
                                                <CreditCard className="size-5" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Your subscription
                                                </p>
                                                <CardTitle className="mt-1 text-xl">
                                                    {subscription.plan.name}
                                                </CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className="mt-2 capitalize border-chart-2/40 bg-chart-2/10 text-chart-2"
                                                >
                                                    {statusLabel(
                                                        subscription.status,
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline" asChild>
                                            <Link href="/settings/billing">
                                                Manage billing
                                            </Link>
                                        </Button>
                                    </div>
                                    <CardContent className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Billing
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {formatMoney(
                                                    subscription.plan.price,
                                                    subscription.plan.currency,
                                                )}
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    /{' '}
                                                    {
                                                        subscription.plan
                                                            .billing_interval
                                                    }
                                                </span>
                                            </p>
                                        </div>
                                        {subscription.trial_ends_at && (
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Trial ends
                                                </p>
                                                <p className="mt-1 font-semibold">
                                                    {formatDateTime(
                                                        subscription.trial_ends_at,
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                        {subscription.current_period_end && (
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Period ends
                                                </p>
                                                <p className="mt-1 font-semibold">
                                                    {formatDateTime(
                                                        subscription.current_period_end,
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Workspace usage
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {subscription.usage.users} /{' '}
                                                {formatLimit(
                                                    subscription.plan.max_users,
                                                )}{' '}
                                                users
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {subscription.usage.customers} /{' '}
                                                {formatLimit(
                                                    subscription.plan
                                                        .max_customers,
                                                )}{' '}
                                                customers
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>
                    )}

                    <section
                        id="calculator"
                        className="border-y border-chart-4/15 bg-chart-4/5"
                    >
                        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                            <div className="mx-auto mb-8 max-w-2xl text-center">
                                <p className="text-sm font-semibold text-chart-4">
                                    Try it out
                                </p>
                                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Loan repayment calculator
                                </h2>
                                <p className="mt-4 text-muted-foreground text-pretty">
                                    Estimate interest and installment amounts for
                                    flat or reducing balance loans — the same
                                    logic used when your organization disburses
                                    loans on this platform.
                                </p>
                            </div>
                            <LoanCalculatorWidget
                                config={loanCalculator}
                                description="Adjust amount and term to explore scenarios. Lenders configure products with specific rates and limits."
                            />
                        </div>
                    </section>

                    <section
                        id="features"
                        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24"
                    >
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold text-chart-2">
                                Platform capabilities
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Everything you need to run lending operations
                            </h2>
                            <p className="mt-4 text-muted-foreground text-pretty">
                                Replace spreadsheets and fragmented tools with a
                                single system designed for disbursement,
                                collections, and oversight.
                            </p>
                        </div>
                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {platformFeatures.map((feature, index) => {
                                const accent = featureAccents[index];

                                return (
                                <Card
                                    key={feature.title}
                                    className={cn(
                                        'border-border/80 bg-card/80 shadow-sm transition-all hover:bg-card hover:shadow-md',
                                        accent.card,
                                    )}
                                >
                                    <CardHeader className="space-y-4">
                                        <span
                                            className={cn(
                                                'flex size-10 items-center justify-center rounded-xl ring-1',
                                                accent.icon,
                                            )}
                                        >
                                            <feature.icon className="size-5" />
                                        </span>
                                        <CardTitle className="text-lg">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="-mt-2 pb-6">
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                            })}
                        </div>
                    </section>

                    {plans.length > 0 && (
                        <section
                            id="pricing"
                            className="welcome-pricing-bg border-y border-chart-3/15 py-20 sm:py-24"
                        >
                            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                                <div className="mx-auto max-w-2xl text-center">
                                    <p className="text-sm font-semibold text-chart-3">
                                        Transparent pricing
                                    </p>
                                    <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                        Plans that scale with your portfolio
                                    </h2>
                                    <p className="mt-4 text-muted-foreground">
                                        Start on a free trial, then upgrade as your
                                        team and loan book grow.
                                    </p>
                                </div>
                                <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-stretch">
                                    {plans.map((plan) => {
                                        const isPopular =
                                            plan.slug === popularPlanSlug;
                                        const accent =
                                            planAccents[plan.slug] ??
                                            defaultPlanAccent;

                                        return (
                                            <Card
                                                key={plan.id}
                                                className={cn(
                                                    'relative flex flex-col border-t-4 bg-card/90 shadow-sm',
                                                    accent.border,
                                                    isPopular &&
                                                        cn(
                                                            'shadow-xl ring-2 ring-chart-2/40 lg:scale-[1.03]',
                                                            accent.glow,
                                                        ),
                                                )}
                                            >
                                                {isPopular && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                        <Badge className="border-0 bg-gradient-to-r from-chart-2 to-chart-3 text-white shadow-md">
                                                            Most popular
                                                        </Badge>
                                                    </div>
                                                )}
                                                {!isPopular && (
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'absolute top-4 right-4 text-xs',
                                                            accent.badge,
                                                        )}
                                                    >
                                                        {plan.slug}
                                                    </Badge>
                                                )}
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="text-xl">
                                                        {plan.name}
                                                    </CardTitle>
                                                    {plan.description && (
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {plan.description}
                                                        </p>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="flex flex-1 flex-col gap-6">
                                                    <div>
                                                        <p className="text-4xl font-semibold tracking-tight">
                                                            {formatMoney(
                                                                plan.price,
                                                                plan.currency,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-sm text-muted-foreground capitalize">
                                                            per{' '}
                                                            {plan.billing_interval}{' '}
                                                            · {plan.trial_days}
                                                            -day trial
                                                        </p>
                                                    </div>
                                                    <Separator />
                                                    <ul className="flex-1 space-y-3 text-sm">
                                                        <li className="flex items-center gap-2">
                                                            <Check className="size-4 shrink-0 text-chart-2" />
                                                            {formatLimit(
                                                                plan.max_users,
                                                            )}{' '}
                                                            team members
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <Check className="size-4 shrink-0 text-chart-2" />
                                                            {formatLimit(
                                                                plan.max_customers,
                                                            )}{' '}
                                                            customers
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <Check className="size-4 shrink-0 text-chart-2" />
                                                            {formatLimit(
                                                                plan.max_active_loans,
                                                            )}{' '}
                                                            active loans
                                                        </li>
                                                        {plan.features.map(
                                                            (feature) => (
                                                                <li
                                                                    key={
                                                                        feature
                                                                    }
                                                                    className="flex items-start gap-2 text-muted-foreground"
                                                                >
                                                                    <Check className="mt-0.5 size-4 shrink-0 text-chart-3" />
                                                                    {feature}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                    {!auth.user && (
                                                        <Button
                                                            className={cn(
                                                                'w-full',
                                                                isPopular &&
                                                                    'bg-gradient-to-r from-chart-2 to-chart-3 text-white shadow-md shadow-chart-2/30 border-0 hover:opacity-95',
                                                            )}
                                                            variant={
                                                                isPopular
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            asChild
                                                        >
                                                            <Link
                                                                href={register()}
                                                            >
                                                                Start{' '}
                                                                {plan.name}{' '}
                                                                trial
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}

                    <section
                        id="how-it-works"
                        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24"
                    >
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold text-chart-1">
                                Onboarding
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Go live in four straightforward steps
                            </h2>
                            <p className="mt-4 text-muted-foreground">
                                From registration to your first loan — most teams
                                are operational within a single working day.
                            </p>
                        </div>

                        <ol className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => (
                                <li key={step.number} className="relative">
                                    {index < steps.length - 1 && (
                                        <span
                                            className="absolute top-5 left-[2.75rem] hidden h-px w-[calc(100%-2.75rem)] bg-gradient-to-r from-chart-2/50 to-chart-3/30 lg:block"
                                            aria-hidden
                                        />
                                    )}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={cn(
                                                    'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-semibold text-white shadow-md',
                                                    stepAccents[index],
                                                )}
                                            >
                                                {step.number}
                                            </span>
                                            <span
                                                className={cn(
                                                    'flex size-11 items-center justify-center rounded-xl ring-1 lg:hidden',
                                                    featureAccents[index].icon,
                                                )}
                                            >
                                                <step.icon className="size-5" />
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">
                                                {step.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {!auth.user && (
                        <section className="welcome-cta-bg relative overflow-hidden border-t border-white/10 text-white">
                            <div
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(1_0_0/0.12),transparent_50%)]"
                                aria-hidden
                            />
                            <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 sm:py-20 lg:flex-row lg:text-left">
                                <div className="flex-1 space-y-3">
                                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {content.cta_title}
                                    </h2>
                                    <p className="max-w-xl text-pretty text-white/85">
                                        {content.cta_description}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                                    <Button
                                        size="lg"
                                        className="bg-white text-chart-3 shadow-lg hover:bg-white/90"
                                        asChild
                                    >
                                        <Link href={register()}>
                                            Create free account
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                        asChild
                                    >
                                        <Link href={login()}>Sign in</Link>
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <footer className="border-t border-chart-2/15 bg-gradient-to-b from-chart-2/5 to-background">
                    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
                            <div className="max-w-sm space-y-4">
                                <AppLogo />
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {content.footer_tagline}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
                                <div>
                                    <p className="font-medium">Product</p>
                                    <ul className="mt-3 space-y-2 text-muted-foreground">
                                        <li>
                                            <a
                                                href="#features"
                                                className="hover:text-chart-2"
                                            >
                                                Features
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#pricing"
                                                className="hover:text-chart-3"
                                            >
                                                Pricing
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#how-it-works"
                                                className="hover:text-chart-1"
                                            >
                                                How it works
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-medium">Account</p>
                                    <ul className="mt-3 space-y-2 text-muted-foreground">
                                        <li>
                                            <Link
                                                href={login()}
                                                className="hover:text-foreground"
                                            >
                                                Log in
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={register()}
                                                className="hover:text-foreground"
                                            >
                                                Register
                                            </Link>
                                        </li>
                                        {auth.user && (
                                            <li>
                                                <Link
                                                    href={dashboard()}
                                                    className="hover:text-foreground"
                                                >
                                                    Dashboard
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-8" />
                        <p className="text-center text-sm text-muted-foreground sm:text-left">
                            © {new Date().getFullYear()} {name}. All rights
                            reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

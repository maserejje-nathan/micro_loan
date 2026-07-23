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
import { LoanCalculatorWidget } from '@/components/loan-calculator/loan-calculator-widget';
import type { LoanCalculatorConfig } from '@/components/loan-calculator/loan-calculator-widget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WelcomeMobileAppLinks } from '@/components/welcome-mobile-app-links';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

const stepIcons = [UserPlus, Building2, Mail, Users];
const featureIcons = [Users, Wallet, Smartphone, BarChart3, FileText, Shield];

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
    mobile_app_title: string;
    mobile_app_description: string;
    ios_app_url?: string | null;
    android_app_url?: string | null;
    popular_plan_slug: string;
    banner_slides?: Array<{
        image_url: string;
        alt: string;
        caption: string | null;
    }>;
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
            <div className="welcome-page min-h-screen bg-[#FAF7F2] text-[#12201B]">
                <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#061612]/70 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="font-display text-lg tracking-[0.08em] text-white transition-opacity hover:opacity-80"
                        >
                            AVANGO
                        </Link>
                        <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
                            <a
                                href="#features"
                                className="transition-colors hover:text-[#A8D5C4]"
                            >
                                Features
                            </a>
                            {plans.length > 0 && (
                                <a
                                    href="#pricing"
                                    className="transition-colors hover:text-[#A8D5C4]"
                                >
                                    Pricing
                                </a>
                            )}
                            <a
                                href="#calculator"
                                className="transition-colors hover:text-[#A8D5C4]"
                            >
                                Calculator
                            </a>
                            <a
                                href="#how-it-works"
                                className="transition-colors hover:text-[#A8D5C4]"
                            >
                                How it works
                            </a>
                            <a
                                href="#mobile-app"
                                className="transition-colors hover:text-[#A8D5C4]"
                            >
                                Mobile app
                            </a>
                        </nav>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Button
                                    asChild
                                    className="rounded-none border-0 bg-[#1F6B57] text-white hover:bg-[#195A49]"
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
                                        className="hidden rounded-none text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                                        asChild
                                    >
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        className="rounded-none border-0 bg-[#1F6B57] text-white hover:bg-[#195A49]"
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

                <main>
                    <section className="welcome-hero-bg relative flex min-h-[52svh] items-end overflow-hidden text-[#F3EEE6] sm:min-h-[56svh]">
                        <div
                            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(6_22_18/0.35)_0%,rgb(6_22_18/0.75)_45%,rgb(6_22_18/0.95)_100%)]"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.07]"
                            aria-hidden
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(168,213,196,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(168,213,196,0.7) 1px, transparent 1px)',
                                backgroundSize: '72px 54px',
                            }}
                        />

                        <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-12 sm:px-6 sm:pb-14 lg:pb-16">
                            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <p className="font-display text-4xl leading-none tracking-[0.06em] text-white sm:text-5xl lg:text-6xl">
                                    AVANGO
                                </p>
                                <p className="mt-2 text-base font-medium tracking-wide text-[#A8D5C4] sm:text-lg">
                                    Credit Platform
                                </p>
                                <h1 className="mt-6 font-display text-2xl leading-tight font-semibold text-balance text-white sm:text-3xl lg:text-4xl">
                                    {content.hero_headline_prefix}{' '}
                                    <span className="text-[#A8D5C4]">
                                        {content.hero_headline_highlight}
                                    </span>
                                </h1>
                                <p className="mt-4 max-w-xl text-base leading-7 text-pretty text-white/75 sm:text-lg">
                                    {content.hero_description}
                                </p>

                                {!auth.user && (
                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <Button
                                            size="lg"
                                            asChild
                                            className="h-12 rounded-none border-0 bg-[#1F6B57] px-6 text-base text-white hover:bg-[#195A49]"
                                        >
                                            <Link href={register()}>
                                                {content.hero_primary_cta}
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="h-12 rounded-none border-white/30 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
                                            asChild
                                        >
                                            <a href="#pricing">
                                                {content.hero_secondary_cta}
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {!auth.user && content.highlights.length > 0 && (
                        <section className="border-b border-[#D8DFD9] bg-white">
                            <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-4 py-5 text-sm text-[#5C6B64] sm:px-6">
                                {content.highlights.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-2"
                                    >
                                        <Check className="size-4 shrink-0 text-[#1F6B57]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {auth.user && subscription && (
                        <section className="border-b border-[#D8DFD9] bg-white">
                            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                                <Card className="overflow-hidden border-[#D8DFD9] shadow-none">
                                    <div className="flex flex-col gap-6 border-b border-[#D8DFD9] bg-[#F3EEE6] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <span className="flex size-11 shrink-0 items-center justify-center bg-[#1F6B57] text-white">
                                                <CreditCard className="size-5" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-medium tracking-wider text-[#5C6B64] uppercase">
                                                    Your subscription
                                                </p>
                                                <CardTitle className="mt-1 font-display text-xl">
                                                    {subscription.plan.name}
                                                </CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className="mt-2 rounded-none border-[#1F6B57]/30 bg-[#1F6B57]/10 text-[#1F6B57] capitalize"
                                                >
                                                    {statusLabel(
                                                        subscription.status,
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="rounded-none"
                                            asChild
                                        >
                                            <Link href="/settings/billing">
                                                Manage billing
                                            </Link>
                                        </Button>
                                    </div>
                                    <CardContent className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <p className="text-xs font-medium tracking-wider text-[#5C6B64] uppercase">
                                                Billing
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {formatMoney(
                                                    subscription.plan.price,
                                                    subscription.plan.currency,
                                                )}
                                                <span className="text-sm font-normal text-[#5C6B64]">
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
                                                <p className="text-xs font-medium tracking-wider text-[#5C6B64] uppercase">
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
                                                <p className="text-xs font-medium tracking-wider text-[#5C6B64] uppercase">
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
                                            <p className="text-xs font-medium tracking-wider text-[#5C6B64] uppercase">
                                                Workspace usage
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {subscription.usage.users} /{' '}
                                                {formatLimit(
                                                    subscription.plan.max_users,
                                                )}{' '}
                                                users
                                            </p>
                                            <p className="text-sm text-[#5C6B64]">
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
                        id="features"
                        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24"
                    >
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold tracking-wide text-[#1F6B57] uppercase">
                                Platform capabilities
                            </p>
                            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                Everything you need to run lending operations
                            </h2>
                            <p className="mt-4 text-pretty text-[#5C6B64]">
                                Replace spreadsheets and fragmented tools with a
                                single system designed for disbursement,
                                collections, and oversight.
                            </p>
                        </div>
                        <div className="mt-14 grid gap-px overflow-hidden border border-[#D8DFD9] bg-[#D8DFD9] sm:grid-cols-2 lg:grid-cols-3">
                            {platformFeatures.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="bg-[#FAF7F2] p-6 transition-colors hover:bg-white sm:p-8"
                                >
                                    <feature.icon className="size-5 text-[#1F6B57]" />
                                    <h3 className="mt-5 font-display text-xl font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-[#5C6B64]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        id="calculator"
                        className="border-y border-[#D8DFD9] bg-white"
                    >
                        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                            <div className="mb-8 max-w-2xl">
                                <p className="text-sm font-semibold tracking-wide text-[#1F6B57] uppercase">
                                    Try it out
                                </p>
                                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Loan repayment calculator
                                </h2>
                                <p className="mt-4 text-pretty text-[#5C6B64]">
                                    Estimate interest and installment amounts
                                    for flat or reducing balance loans — the
                                    same logic used when your organization
                                    disburses loans on this platform.
                                </p>
                            </div>
                            <LoanCalculatorWidget
                                config={loanCalculator}
                                description="Adjust amount and term to explore scenarios. Lenders configure products with specific rates and limits."
                            />
                        </div>
                    </section>

                    {plans.length > 0 && (
                        <section
                            id="pricing"
                            className="welcome-pricing-bg border-b border-[#D8DFD9] py-20 sm:py-24"
                        >
                            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                                <div className="max-w-2xl">
                                    <p className="text-sm font-semibold tracking-wide text-[#1F6B57] uppercase">
                                        Transparent pricing
                                    </p>
                                    <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                        Plans that scale with your portfolio
                                    </h2>
                                    <p className="mt-4 text-[#5C6B64]">
                                        Start on a free trial, then upgrade as
                                        your team and loan book grow.
                                    </p>
                                </div>
                                <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:items-stretch">
                                    {plans.map((plan) => {
                                        const isPopular =
                                            plan.slug === popularPlanSlug;

                                        return (
                                            <Card
                                                key={plan.id}
                                                className={cn(
                                                    'relative flex flex-col border-[#D8DFD9] bg-white shadow-none',
                                                    isPopular &&
                                                        'border-[#1F6B57] ring-1 ring-[#1F6B57]',
                                                )}
                                            >
                                                {isPopular && (
                                                    <div className="absolute top-0 right-0 bg-[#1F6B57] px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                                                        Most popular
                                                    </div>
                                                )}
                                                <CardHeader className="pb-4">
                                                    <CardTitle className="font-display text-2xl">
                                                        {plan.name}
                                                    </CardTitle>
                                                    {plan.description && (
                                                        <p className="text-sm leading-relaxed text-[#5C6B64]">
                                                            {plan.description}
                                                        </p>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="flex flex-1 flex-col gap-6">
                                                    <div>
                                                        <p className="font-display text-4xl font-semibold tracking-tight">
                                                            {formatMoney(
                                                                plan.price,
                                                                plan.currency,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-sm text-[#5C6B64] capitalize">
                                                            per{' '}
                                                            {
                                                                plan.billing_interval
                                                            }{' '}
                                                            · {plan.trial_days}
                                                            -day trial
                                                        </p>
                                                    </div>
                                                    <Separator />
                                                    <ul className="flex-1 space-y-3 text-sm">
                                                        <li className="flex items-center gap-2">
                                                            <Check className="size-4 shrink-0 text-[#1F6B57]" />
                                                            {formatLimit(
                                                                plan.max_users,
                                                            )}{' '}
                                                            team members
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <Check className="size-4 shrink-0 text-[#1F6B57]" />
                                                            {formatLimit(
                                                                plan.max_customers,
                                                            )}{' '}
                                                            customers
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <Check className="size-4 shrink-0 text-[#1F6B57]" />
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
                                                                    className="flex items-start gap-2 text-[#5C6B64]"
                                                                >
                                                                    <Check className="mt-0.5 size-4 shrink-0 text-[#1F6B57]" />
                                                                    {feature}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                    {!auth.user && (
                                                        <Button
                                                            className={cn(
                                                                'w-full rounded-none',
                                                                isPopular
                                                                    ? 'border-0 bg-[#1F6B57] text-white hover:bg-[#195A49]'
                                                                    : 'border-[#D8DFD9]',
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
                            <p className="text-sm font-semibold tracking-wide text-[#1F6B57] uppercase">
                                Onboarding
                            </p>
                            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                Go live in four straightforward steps
                            </h2>
                            <p className="mt-4 text-[#5C6B64]">
                                From registration to your first loan — most
                                teams are operational within a single working
                                day.
                            </p>
                        </div>

                        <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step) => (
                                <li key={step.number} className="relative">
                                    <div className="flex flex-col gap-4 border-t-2 border-[#1F6B57] pt-6">
                                        <span className="font-display text-4xl font-semibold text-[#1F6B57]/35">
                                            {String(step.number).padStart(
                                                2,
                                                '0',
                                            )}
                                        </span>
                                        <div>
                                            <h3 className="font-display text-lg font-semibold">
                                                {step.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-[#5C6B64]">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section
                        id="mobile-app"
                        className="border-y border-[#D8DFD9] bg-white"
                    >
                        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-xl">
                                <p className="text-sm font-semibold tracking-wide text-[#1F6B57] uppercase">
                                    Lender mobile app
                                </p>
                                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                    {content.mobile_app_title}
                                </h2>
                                <p className="mt-4 text-pretty text-[#5C6B64]">
                                    {content.mobile_app_description}
                                </p>
                            </div>
                            <WelcomeMobileAppLinks
                                iosUrl={content.ios_app_url}
                                androidUrl={content.android_app_url}
                            />
                        </div>
                    </section>

                    {!auth.user && (
                        <section className="welcome-cta-bg relative overflow-hidden text-white">
                            <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-xl space-y-3">
                                    <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                                        {content.cta_title}
                                    </h2>
                                    <p className="text-pretty text-white/75">
                                        {content.cta_description}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                                    <Button
                                        size="lg"
                                        className="h-12 rounded-none bg-white px-6 text-[#0B2420] hover:bg-[#F3EEE6]"
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
                                        className="h-12 rounded-none border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                                        asChild
                                    >
                                        <Link href={login()}>Sign in</Link>
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <footer className="border-t border-[#D8DFD9] bg-[#061612] text-[#F3EEE6]">
                    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
                            <div className="max-w-sm space-y-4">
                                <p className="font-display text-xl tracking-[0.08em]">
                                    AVANGO
                                </p>
                                <p className="text-sm leading-relaxed text-white/65">
                                    {content.footer_tagline}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
                                <div>
                                    <p className="font-medium text-white">
                                        Product
                                    </p>
                                    <ul className="mt-3 space-y-2 text-white/65">
                                        <li>
                                            <a
                                                href="#features"
                                                className="hover:text-[#A8D5C4]"
                                            >
                                                Features
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#pricing"
                                                className="hover:text-[#A8D5C4]"
                                            >
                                                Pricing
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#how-it-works"
                                                className="hover:text-[#A8D5C4]"
                                            >
                                                How it works
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#mobile-app"
                                                className="hover:text-[#A8D5C4]"
                                            >
                                                Mobile app
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        Get the app
                                    </p>
                                    <div className="mt-4">
                                        <WelcomeMobileAppLinks
                                            iosUrl={content.ios_app_url}
                                            androidUrl={content.android_app_url}
                                            variant="dark"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        Account
                                    </p>
                                    <ul className="mt-3 space-y-2 text-white/65">
                                        <li>
                                            <Link
                                                href={login()}
                                                className="hover:text-[#A8D5C4]"
                                            >
                                                Log in
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={register()}
                                                className="hover:text-[#A8D5C4]"
                                            >
                                                Register
                                            </Link>
                                        </li>
                                        {auth.user && (
                                            <li>
                                                <Link
                                                    href={dashboard()}
                                                    className="hover:text-[#A8D5C4]"
                                                >
                                                    Dashboard
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-8 bg-white/10" />
                        <p className="text-center text-sm text-white/50 sm:text-left">
                            © {new Date().getFullYear()} {name}. All rights
                            reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

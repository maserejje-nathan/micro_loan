import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthBrandedLayout({
    children,
    title,
    description,
    size = 'default',
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative min-h-svh overflow-hidden bg-[#061612] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
            <aside className="relative flex flex-col justify-between overflow-hidden px-6 py-8 text-[#F3EEE6] sm:px-10 sm:py-10 lg:min-h-svh lg:px-14 lg:py-12">
                <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#061612_0%,#0B2420_48%,#143D34_100%)]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-[#1F6B57]/30 blur-2xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute top-44 -left-20 size-48 rounded-full bg-[#2F8F74]/20 blur-2xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    aria-hidden
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(168,213,196,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(168,213,196,0.55) 1px, transparent 1px)',
                        backgroundSize: '72px 54px',
                        maskImage:
                            'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
                    }}
                />

                <div className="relative z-10 space-y-8">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#A8D5C4] transition-opacity hover:opacity-80"
                    >
                        ← Back to home
                    </Link>

                    <div className="max-w-md animate-in fade-in slide-in-from-bottom-3 duration-700">
                        <p className="font-display text-5xl leading-none tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
                            AVANGO
                        </p>
                        <p className="mt-3 text-lg font-medium tracking-wide text-[#A8D5C4] sm:text-xl">
                            Credit Platform
                        </p>
                        <p className="mt-5 max-w-sm text-base leading-7 text-[#F3EEE6]/80">
                            Run loans, customers, and collections from one
                            secure workspace — built for lending teams and
                            platform administrators.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 mt-10 hidden max-w-md space-y-3 lg:block">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#A8D5C4] uppercase">
                        For lenders
                    </p>
                    <ul className="space-y-2 text-sm leading-6 text-[#F3EEE6]/75">
                        <li>Manage applications, disbursements, and repayments</li>
                        <li>Invite officers and cashiers with role-based access</li>
                        <li>Track portfolio health from anywhere</li>
                    </ul>
                </div>
            </aside>

            <main className="relative z-10 flex items-end justify-center lg:items-center lg:bg-[#FAF7F2]">
                <div
                    className={cn(
                        'w-full animate-in fade-in slide-in-from-bottom-4 duration-700',
                        'rounded-none bg-[#FAF7F2] px-6 pt-5 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.22)]',
                        'sm:px-10 sm:pt-8 sm:pb-10',
                        'lg:bg-transparent lg:px-12 lg:py-12 lg:shadow-none xl:px-16',
                        size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
                    )}
                >
                    <div className="mx-auto mb-5 h-1 w-10 bg-[#D2D8D3] lg:hidden" />

                    <div className="mb-8 space-y-2">
                        {title ? (
                            <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-[#12201B] sm:text-4xl">
                                {title}
                            </h1>
                        ) : null}
                        {description ? (
                            <p className="text-sm leading-6 text-[#5C6B64] sm:text-base">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}

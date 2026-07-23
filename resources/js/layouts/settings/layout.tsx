import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { SettingsNav } from '@/components/settings/settings-nav';
import { Separator } from '@/components/ui/separator';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-1 flex-col gap-6 px-3 pb-10 sm:gap-8 sm:px-4 sm:py-6">
            <Heading
                title="Settings"
                description="Manage your account, team workspace, billing, and borrower portal."
            />

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-60">
                    <SettingsNav />
                </aside>

                <Separator className="lg:hidden" />

                <div className="min-w-0 flex-1">
                    <section className="w-full max-w-3xl space-y-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}

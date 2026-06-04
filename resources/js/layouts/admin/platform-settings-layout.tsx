import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { PlatformSettingsNav } from '@/components/admin/platform-settings-nav';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { index as settingsIndex } from '@/routes/admin/settings';

export default function PlatformSettingsLayout({
    children,
}: PropsWithChildren) {
    const page = usePage();
    const pathname = new URL(
        page.url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).pathname;

    const isOverview = pathname === settingsIndex().url;

    return (
        <div className="w-full min-w-0 p-4 pb-10">
            {isOverview && (
                <Heading
                    title="Platform settings"
                    description="Configure marketing content, borrower notifications, and payment integrations for the whole platform."
                />
            )}

            <div
                className={cn(
                    'flex flex-col gap-8 lg:flex-row lg:gap-10',
                    isOverview && 'mt-8',
                )}
            >
                <aside className="w-full shrink-0 lg:w-56 xl:w-64">
                    <div className="lg:sticky lg:top-4">
                        <PlatformSettingsNav />
                    </div>
                </aside>

                <Separator className="lg:hidden" />

                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}

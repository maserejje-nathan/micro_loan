import { Head } from '@inertiajs/react';
import { platformSettingsOverviewLinks } from '@/config/admin-platform-settings-nav';
import { IntegrationStatusBadge } from '@/components/admin/integration-status-badge';
import { PlatformSettingsFlash } from '@/components/admin/platform-settings-flash';
import { SettingsLinkCard } from '@/components/admin/settings-link-card';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    africasTalking,
    index as settingsIndex,
    notifications,
    smtp,
    yoPayments,
} from '@/routes/admin/settings';

type IntegrationStatus = {
    driver: string;
    configured: boolean;
    connected: boolean;
    message: string;
};

export default function AdminSettingsIndex({
    yoStatus,
    africasTalkingStatus,
    smtpStatus,
    notificationDriver,
    mailDriver,
    mobileMoneyDriver,
}: {
    yoStatus: IntegrationStatus;
    africasTalkingStatus: IntegrationStatus;
    smtpStatus: IntegrationStatus;
    notificationDriver: string;
    mailDriver: string;
    mobileMoneyDriver: string;
}) {
    const integrations = [
        {
            label: 'SMS (Africa\'s Talking)',
            status: africasTalkingStatus,
            detail: notificationDriver,
        },
        {
            label: 'Email (SMTP)',
            status: smtpStatus,
            detail: mailDriver,
        },
        {
            label: 'Mobile money (Yo!)',
            status: yoStatus,
            detail: mobileMoneyDriver,
        },
    ];

    const metaByHref: Record<string, string> = {
        [notifications().url]: `SMS driver: ${notificationDriver}`,
        [africasTalking().url]: africasTalkingStatus.message,
        [smtp().url]: smtpStatus.message,
        [yoPayments().url]: `Driver: ${mobileMoneyDriver}`,
    };

    return (
        <>
            <Head title="Platform settings" />
            <div className="space-y-8">
                <PlatformSettingsFlash />

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            Integration health
                        </CardTitle>
                        <CardDescription>
                            Quick view of outbound notification and payment
                            drivers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {integrations.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border border-border bg-muted p-4"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium">
                                            {item.label}
                                        </p>
                                        <IntegrationStatusBadge
                                            status={item.status}
                                        />
                                    </div>
                                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                                        {item.detail}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {item.status.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {platformSettingsOverviewLinks.map((group) => (
                    <section key={group.group} className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            {group.group}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {group.items.map((item) => (
                                <SettingsLinkCard
                                    key={item.href}
                                    title={item.title}
                                    description={
                                        item.description ?? ''
                                    }
                                    href={item.href}
                                    icon={item.icon}
                                    meta={metaByHref[item.href]}
                                    status={
                                        item.href.includes('africas-talking')
                                            ? africasTalkingStatus
                                            : item.href.includes('/smtp')
                                              ? smtpStatus
                                              : item.href.includes(
                                                    'yo-payments',
                                                )
                                                ? yoStatus
                                                : undefined
                                    }
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}

AdminSettingsIndex.layout = {
    breadcrumbs: [
        { title: 'Settings', href: settingsIndex().url },
    ],
};

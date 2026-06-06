import { router } from '@inertiajs/react';
import { IntegrationStatusBadge } from '@/components/admin/integration-status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type IntegrationStatus = {
    driver: string;
    configured: boolean;
    connected?: boolean;
    sandbox?: boolean;
    api_url?: string;
    host?: string;
    from_address?: string;
    message: string;
};

export function IntegrationStatusCard({
    title,
    status,
    testUrl,
}: {
    title: string;
    status: IntegrationStatus;
    testUrl?: string;
}) {
    return (
        <Card variant="muted" className="border-dashed">
            <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <IntegrationStatusBadge status={status} />
                </div>
                <CardDescription>{status.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <dl className="grid gap-2 sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Driver</dt>
                        <dd className="font-mono">{status.driver}</dd>
                    </div>
                    {status.sandbox !== undefined && (
                        <div>
                            <dt className="text-muted-foreground">Mode</dt>
                            <dd>{status.sandbox ? 'Sandbox' : 'Production'}</dd>
                        </div>
                    )}
                    {status.api_url && (
                        <div className="sm:col-span-2">
                            <dt className="text-muted-foreground">API URL</dt>
                            <dd className="font-mono text-xs break-all">
                                {status.api_url}
                            </dd>
                        </div>
                    )}
                    {status.host && (
                        <div>
                            <dt className="text-muted-foreground">Host</dt>
                            <dd className="font-mono text-xs">{status.host}</dd>
                        </div>
                    )}
                    {status.from_address && (
                        <div>
                            <dt className="text-muted-foreground">From</dt>
                            <dd className="font-mono text-xs">
                                {status.from_address}
                            </dd>
                        </div>
                    )}
                </dl>
                {testUrl && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.post(testUrl, {}, { preserveScroll: true })
                        }
                    >
                        Test connection
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

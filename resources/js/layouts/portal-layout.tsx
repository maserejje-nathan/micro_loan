import PortalLayoutTemplate from '@/layouts/portal/portal-layout';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayoutTemplate>{children}</PortalLayoutTemplate>;
}

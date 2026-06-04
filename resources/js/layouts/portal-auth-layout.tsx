import PortalCardLayout from '@/layouts/auth/portal-card-layout';

export default function PortalAuthLayout({
    title = '',
    description = '',
    organizationName = '',
    size = 'default',
    children,
}: {
    title?: string;
    description?: string;
    organizationName?: string;
    size?: 'default' | 'lg' | 'xl';
    children: React.ReactNode;
}) {
    return (
        <PortalCardLayout
            title={title}
            description={description}
            organizationName={organizationName}
            size={size}
        >
            {children}
        </PortalCardLayout>
    );
}

import AuthLayoutTemplate from '@/layouts/auth/auth-branded-layout';

export default function AuthLayout({
    title = '',
    description = '',
    size = 'default',
    children,
}: {
    title?: string;
    description?: string;
    size?: 'default' | 'lg';
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} size={size}>
            {children}
        </AuthLayoutTemplate>
    );
}

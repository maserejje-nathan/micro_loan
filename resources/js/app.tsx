import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import PlatformSettingsLayout from '@/layouts/admin/platform-settings-layout';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import PortalAuthLayout from '@/layouts/portal-auth-layout';
import PortalLayout from '@/layouts/portal-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'portal/login':
            case name === 'portal/register':
                return PortalAuthLayout;
            case name.startsWith('auth/'):
            case name.startsWith('onboarding/'):
            case name.startsWith('invitations/'):
                return AuthLayout;
            case name.startsWith('portal/'):
                return PortalLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('admin/settings'):
                return [AdminLayout, PlatformSettingsLayout];
            case name.startsWith('admin/'):
                return AdminLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

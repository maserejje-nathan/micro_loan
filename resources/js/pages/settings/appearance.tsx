import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import {
    SettingsPageHeader,
    SettingsSection,
} from '@/components/settings/settings-section';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <SettingsPageHeader
                title="Appearance"
                description="Choose how Avango looks for you on this device."
            />

            <SettingsSection
                title="Theme"
                description="Switch between light, dark, or match your system preference."
            >
                <AppearanceTabs />
            </SettingsSection>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};

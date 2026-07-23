import { Form, Head, Link } from '@inertiajs/react';
import {
    PORTAL_REGISTER_FORM_ID,
    PortalRegistrationForm,
} from '@/components/portal/portal-registration-form';
import { Button } from '@/components/ui/button';
import { store } from '@/routes/portal/register';

type SelectOption = { value: string; label: string };

type Props = {
    organization: { name: string; slug: string; currency?: string } | null;
    requiresOrganizationSlug: boolean;
    allowSelfRegistration: boolean;
    portalLoginUrl: string | null;
    genders: SelectOption[];
    idTypes: SelectOption[];
    employmentStatuses: SelectOption[];
};

export default function PortalRegister({
    organization,
    requiresOrganizationSlug,
    allowSelfRegistration,
    portalLoginUrl,
    genders,
    idTypes,
    employmentStatuses,
}: Props) {
    if (!allowSelfRegistration && !requiresOrganizationSlug) {
        return (
            <>
                <Head title="Create account" />
                <p className="text-center text-sm text-muted-foreground">
                    Self-registration is not available for this lender. Contact
                    them to get portal access.
                </p>
                <Button variant="outline" className="w-full" asChild>
                    <Link href={portalLoginUrl ?? '/portal/login'}>
                        Back to sign in
                    </Link>
                </Button>
            </>
        );
    }

    return (
        <>
            <Head title="Create account" />

            <Form
                id={PORTAL_REGISTER_FORM_ID}
                {...store.form()}
                encType="multipart/form-data"
                forceFormData
                noValidate
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <PortalRegistrationForm
                            errors={errors}
                            requiresOrganizationSlug={requiresOrganizationSlug}
                            organizationSlug={organization?.slug}
                            organizationName={organization?.name}
                            currency={organization?.currency ?? 'UGX'}
                            genders={genders}
                            idTypes={idTypes}
                            employmentStatuses={employmentStatuses}
                            processing={processing}
                        />

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href={portalLoginUrl ?? '/portal/login'}
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

PortalRegister.layout = (props: Props) => ({
    title: 'Create your account',
    description: props.organization
        ? `Join ${props.organization.name} in a few steps — account, profile, then you are in.`
        : 'Create your borrower account in a few simple steps.',
    organizationName: props.organization?.name,
    size: 'xl' as const,
});

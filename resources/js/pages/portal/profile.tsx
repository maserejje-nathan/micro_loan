import { Form, Head, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Lock,
    MapPin,
    Phone,
    User,
    Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { CustomerAvatar } from '@/components/customer-avatar';
import { PaymentReminderChannelsField } from '@/components/customers/payment-reminder-channels-field';
import { FormField } from '@/components/form-field';
import PasswordInput from '@/components/password-input';
import { PortalPage } from '@/components/portal/portal-page';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    notificationPreferences,
    password as updatePassword,
    update,
} from '@/routes/portal/profile';

type CustomerProfile = {
    reference_number: string;
    photo_url: string | null;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
    address: string | null;
    district: string | null;
    city: string | null;
    occupation: string | null;
    employer_name: string | null;
    monthly_income: number | null;
    next_of_kin_name: string | null;
    next_of_kin_phone: string | null;
    next_of_kin_relationship: string | null;
    payment_reminder_channels: string[];
};

type ChannelOption = {
    value: string;
    label: string;
};

function SectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-4" />
            </div>
            <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </div>
    );
}

export default function PortalProfile({
    customer,
    currency,
    notificationChannels,
}: {
    customer: CustomerProfile;
    currency: string;
    notificationChannels: ChannelOption[];
}) {
    const { flash } = usePage().props as {
        flash?: { success?: string };
    };

    const fullName = `${customer.first_name} ${customer.last_name}`.trim();

    return (
        <>
            <Head title="Profile" />
            <PortalPage>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Profile
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your personal details and sign-in password.
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
                        {flash.success}
                    </div>
                )}

                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                        <CustomerAvatar
                            name={fullName}
                            photoUrl={customer.photo_url}
                            size="lg"
                        />
                        <div className="space-y-1">
                            <p className="text-xl font-semibold">{fullName}</p>
                            <p className="font-mono text-sm text-muted-foreground">
                                {customer.reference_number}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Phone className="size-3.5" />
                                    {customer.phone}
                                </span>
                                {customer.email && (
                                    <span>{customer.email}</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <SectionHeader
                            icon={User}
                            title="Personal information"
                            description="Your name and contact details. Phone is managed by your lender."
                        />
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form
                            {...update.form()}
                            disableWhileProcessing
                            className="space-y-8"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormField
                                            id="first_name"
                                            label="First name"
                                            error={errors.first_name}
                                            required
                                        >
                                            <Input
                                                id="first_name"
                                                name="first_name"
                                                defaultValue={
                                                    customer.first_name
                                                }
                                                required
                                                className="h-10"
                                                aria-invalid={
                                                    !!errors.first_name
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            id="last_name"
                                            label="Last name"
                                            error={errors.last_name}
                                            required
                                        >
                                            <Input
                                                id="last_name"
                                                name="last_name"
                                                defaultValue={
                                                    customer.last_name
                                                }
                                                required
                                                className="h-10"
                                                aria-invalid={
                                                    !!errors.last_name
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            id="phone"
                                            label="Phone"
                                            hint="Contact your lender to update your phone number."
                                            className="sm:col-span-2"
                                        >
                                            <Input
                                                id="phone"
                                                value={customer.phone}
                                                disabled
                                                className="h-10 bg-muted"
                                            />
                                        </FormField>
                                        <FormField
                                            id="email"
                                            label="Email"
                                            error={errors.email}
                                            className="sm:col-span-2"
                                        >
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={
                                                    customer.email ?? ''
                                                }
                                                className="h-10"
                                                aria-invalid={!!errors.email}
                                            />
                                        </FormField>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            Address
                                        </p>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                id="address"
                                                label="Street address"
                                                error={errors.address}
                                                className="sm:col-span-2"
                                            >
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    defaultValue={
                                                        customer.address ?? ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.address
                                                    }
                                                />
                                            </FormField>
                                            <FormField
                                                id="city"
                                                label="City"
                                                error={errors.city}
                                            >
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    defaultValue={
                                                        customer.city ?? ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={!!errors.city}
                                                />
                                            </FormField>
                                            <FormField
                                                id="district"
                                                label="District"
                                                error={errors.district}
                                            >
                                                <Input
                                                    id="district"
                                                    name="district"
                                                    defaultValue={
                                                        customer.district ?? ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.district
                                                    }
                                                />
                                            </FormField>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                                            <Briefcase className="size-4 text-muted-foreground" />
                                            Employment & income
                                        </p>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                id="occupation"
                                                label="Occupation"
                                                error={errors.occupation}
                                            >
                                                <Input
                                                    id="occupation"
                                                    name="occupation"
                                                    defaultValue={
                                                        customer.occupation ??
                                                        ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.occupation
                                                    }
                                                />
                                            </FormField>
                                            <FormField
                                                id="employer_name"
                                                label="Employer"
                                                error={errors.employer_name}
                                            >
                                                <Input
                                                    id="employer_name"
                                                    name="employer_name"
                                                    defaultValue={
                                                        customer.employer_name ??
                                                        ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.employer_name
                                                    }
                                                />
                                            </FormField>
                                            <FormField
                                                id="monthly_income"
                                                label={`Monthly income (${currency})`}
                                                error={errors.monthly_income}
                                                className="sm:col-span-2"
                                            >
                                                <Input
                                                    id="monthly_income"
                                                    name="monthly_income"
                                                    type="number"
                                                    min={0}
                                                    defaultValue={
                                                        customer.monthly_income ??
                                                        ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.monthly_income
                                                    }
                                                />
                                            </FormField>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                                            <Users className="size-4 text-muted-foreground" />
                                            Next of kin
                                        </p>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                id="next_of_kin_name"
                                                label="Full name"
                                                error={errors.next_of_kin_name}
                                            >
                                                <Input
                                                    id="next_of_kin_name"
                                                    name="next_of_kin_name"
                                                    defaultValue={
                                                        customer.next_of_kin_name ??
                                                        ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.next_of_kin_name
                                                    }
                                                />
                                            </FormField>
                                            <FormField
                                                id="next_of_kin_phone"
                                                label="Phone"
                                                error={errors.next_of_kin_phone}
                                            >
                                                <Input
                                                    id="next_of_kin_phone"
                                                    name="next_of_kin_phone"
                                                    defaultValue={
                                                        customer.next_of_kin_phone ??
                                                        ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.next_of_kin_phone
                                                    }
                                                />
                                            </FormField>
                                            <FormField
                                                id="next_of_kin_relationship"
                                                label="Relationship"
                                                error={
                                                    errors.next_of_kin_relationship
                                                }
                                                className="sm:col-span-2"
                                            >
                                                <Input
                                                    id="next_of_kin_relationship"
                                                    name="next_of_kin_relationship"
                                                    defaultValue={
                                                        customer.next_of_kin_relationship ??
                                                        ''
                                                    }
                                                    className="h-10"
                                                    aria-invalid={
                                                        !!errors.next_of_kin_relationship
                                                    }
                                                />
                                            </FormField>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Save changes
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <SectionHeader
                            icon={Bell}
                            title="Payment reminders"
                            description="Choose how you want to receive reminders when an installment is due or overdue."
                        />
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form
                            {...notificationPreferences.form()}
                            preserveScroll
                            disableWhileProcessing
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <PaymentReminderChannelsField
                                        channels={notificationChannels}
                                        selected={
                                            customer.payment_reminder_channels
                                        }
                                        errors={errors}
                                        hint="Add an email address above if you want email reminders."
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Save reminder preferences
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <SectionHeader
                            icon={Lock}
                            title="Password"
                            description="Update the password you use to sign in to this portal."
                        />
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form
                            {...updatePassword.form()}
                            resetOnSuccess
                            disableWhileProcessing
                            className="max-w-md space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <FormField
                                        id="current_password"
                                        label="Current password"
                                        error={errors.current_password}
                                        required
                                    >
                                        <PasswordInput
                                            id="current_password"
                                            name="current_password"
                                            required
                                            autoComplete="current-password"
                                            className="h-10"
                                            aria-invalid={
                                                !!errors.current_password
                                            }
                                        />
                                    </FormField>
                                    <FormField
                                        id="password"
                                        label="New password"
                                        error={errors.password}
                                        required
                                    >
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            className="h-10"
                                            aria-invalid={!!errors.password}
                                        />
                                    </FormField>
                                    <FormField
                                        id="password_confirmation"
                                        label="Confirm new password"
                                        error={errors.password_confirmation}
                                        required
                                    >
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            className="h-10"
                                            aria-invalid={
                                                !!errors.password_confirmation
                                            }
                                        />
                                    </FormField>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Update password
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </PortalPage>
        </>
    );
}

PortalProfile.layout = {
    breadcrumbs: [
        { title: 'Overview', href: '/portal' },
        { title: 'Profile', href: '/portal/profile' },
    ],
};

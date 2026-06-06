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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
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
                            action="/portal/profile"
                            method="put"
                            className="space-y-8"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first_name">
                                                First name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                name="first_name"
                                                defaultValue={
                                                    customer.first_name
                                                }
                                                required
                                            />
                                            {errors.first_name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.first_name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="last_name">
                                                Last name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                name="last_name"
                                                defaultValue={
                                                    customer.last_name
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                value={customer.phone}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Contact your lender to update
                                                your phone number.
                                            </p>
                                        </div>
                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={
                                                    customer.email ?? ''
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            Address
                                        </p>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-2 sm:col-span-2">
                                                <Label htmlFor="address">
                                                    Street address
                                                </Label>
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    defaultValue={
                                                        customer.address ?? ''
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="city">
                                                    City
                                                </Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    defaultValue={
                                                        customer.city ?? ''
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="district">
                                                    District
                                                </Label>
                                                <Input
                                                    id="district"
                                                    name="district"
                                                    defaultValue={
                                                        customer.district ?? ''
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                                            <Briefcase className="size-4 text-muted-foreground" />
                                            Employment & income
                                        </p>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="occupation">
                                                    Occupation
                                                </Label>
                                                <Input
                                                    id="occupation"
                                                    name="occupation"
                                                    defaultValue={
                                                        customer.occupation ??
                                                        ''
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="employer_name">
                                                    Employer
                                                </Label>
                                                <Input
                                                    id="employer_name"
                                                    name="employer_name"
                                                    defaultValue={
                                                        customer.employer_name ??
                                                        ''
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2 sm:col-span-2">
                                                <Label htmlFor="monthly_income">
                                                    Monthly income ({currency})
                                                </Label>
                                                <Input
                                                    id="monthly_income"
                                                    name="monthly_income"
                                                    type="number"
                                                    min={0}
                                                    defaultValue={
                                                        customer.monthly_income ??
                                                        ''
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                                            <Users className="size-4 text-muted-foreground" />
                                            Next of kin
                                        </p>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="next_of_kin_name">
                                                    Full name
                                                </Label>
                                                <Input
                                                    id="next_of_kin_name"
                                                    name="next_of_kin_name"
                                                    defaultValue={
                                                        customer.next_of_kin_name ??
                                                        ''
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="next_of_kin_phone">
                                                    Phone
                                                </Label>
                                                <Input
                                                    id="next_of_kin_phone"
                                                    name="next_of_kin_phone"
                                                    defaultValue={
                                                        customer.next_of_kin_phone ??
                                                        ''
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2 sm:col-span-2">
                                                <Label htmlFor="next_of_kin_relationship">
                                                    Relationship
                                                </Label>
                                                <Input
                                                    id="next_of_kin_relationship"
                                                    name="next_of_kin_relationship"
                                                    defaultValue={
                                                        customer.next_of_kin_relationship ??
                                                        ''
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing}>
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
                            action="/portal/profile/notification-preferences"
                            method="put"
                            preserveScroll
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
                            action="/portal/profile/password"
                            method="put"
                            resetOnSuccess
                            className="max-w-md space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_password">
                                            Current password
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            name="current_password"
                                            required
                                            autoComplete="current-password"
                                        />
                                        {errors.current_password && (
                                            <p className="text-sm text-destructive">
                                                {errors.current_password}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            New password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm new password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                    >
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

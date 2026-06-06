import type { ReactNode } from 'react';
import { CustomerIdDocumentFields } from '@/components/customers/customer-id-document-fields';
import { CustomerPhotoField } from '@/components/customers/customer-photo-field';
import { PaymentReminderChannelsField } from '@/components/customers/payment-reminder-channels-field';
import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

export type CustomerFormValues = {
    id?: number;
    reference_number?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string | null;
    payment_reminder_channels?: string[];
    national_id?: string | null;
    id_type?: string | null;
    id_expiry_date?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    nationality?: string | null;
    district?: string | null;
    city?: string | null;
    address?: string | null;
    occupation?: string | null;
    employment_status?: string | null;
    employer_name?: string | null;
    monthly_income?: number | null;
    next_of_kin_name?: string | null;
    next_of_kin_phone?: string | null;
    next_of_kin_relationship?: string | null;
    photo_url?: string | null;
    id_front_url?: string | null;
    id_back_url?: string | null;
    status?: string;
};

type SelectOption = {
    value: string;
    label: string;
};

type CustomerFormFieldsProps = {
    errors: Record<string, string | undefined>;
    customer?: CustomerFormValues;
    statuses?: SelectOption[];
    genders: SelectOption[];
    idTypes: SelectOption[];
    employmentStatuses: SelectOption[];
    notificationChannels: SelectOption[];
    mode: 'create' | 'edit';
};

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {title}
                </p>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

function EnumSelect({
    id,
    name,
    options,
    defaultValue,
    required,
    error,
    placeholder = 'Not specified',
}: {
    id: string;
    name: string;
    options: SelectOption[];
    defaultValue?: string | null;
    required?: boolean;
    error?: string;
    placeholder?: string;
}) {
    return (
        <NativeSelect
            id={id}
            name={name}
            defaultValue={defaultValue ?? ''}
            required={required}
            aria-invalid={!!error}
        >
            {!required && <option value="">{placeholder}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </NativeSelect>
    );
}

export function CustomerFormFields({
    errors,
    customer,
    statuses = [],
    genders,
    idTypes,
    employmentStatuses,
    notificationChannels,
    mode,
}: CustomerFormFieldsProps) {
    return (
        <div className="space-y-8">
            {mode === 'edit' && customer?.reference_number && (
                <div className="rounded-lg border border-border bg-muted px-4 py-3">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Customer reference
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium">
                        {customer.reference_number}
                    </p>
                </div>
            )}

            <CustomerPhotoField
                mode={mode}
                photoUrl={customer?.photo_url}
                error={errors.photo}
            />

            <FormSection
                title="Personal details"
                description="Legal name and biographical information for KYC."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="first_name"
                        label="First name"
                        error={errors.first_name}
                        required
                    >
                        <Input
                            id="first_name"
                            name="first_name"
                            defaultValue={customer?.first_name ?? ''}
                            required
                            autoFocus={mode === 'create'}
                            placeholder="Jane"
                            aria-invalid={!!errors.first_name}
                            className="h-10"
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
                            defaultValue={customer?.last_name ?? ''}
                            required
                            placeholder="Namukasa"
                            aria-invalid={!!errors.last_name}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="date_of_birth"
                        label="Date of birth"
                        error={errors.date_of_birth}
                        hint="Must be in the past"
                    >
                        <Input
                            id="date_of_birth"
                            name="date_of_birth"
                            type="date"
                            defaultValue={customer?.date_of_birth ?? ''}
                            aria-invalid={!!errors.date_of_birth}
                            className="h-10"
                        />
                    </FormField>
                    <FormField id="gender" label="Gender" error={errors.gender}>
                        <EnumSelect
                            id="gender"
                            name="gender"
                            options={genders}
                            defaultValue={customer?.gender}
                            error={errors.gender}
                        />
                    </FormField>
                    <FormField
                        id="nationality"
                        label="Nationality"
                        error={errors.nationality}
                    >
                        <Input
                            id="nationality"
                            name="nationality"
                            defaultValue={customer?.nationality ?? ''}
                            placeholder="Ugandan"
                            aria-invalid={!!errors.nationality}
                            className="h-10"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                title="Identity verification"
                description="Government-issued ID used for KYC and duplicate checks."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="id_type"
                        label="ID document type"
                        error={errors.id_type}
                    >
                        <EnumSelect
                            id="id_type"
                            name="id_type"
                            options={idTypes}
                            defaultValue={customer?.id_type}
                            error={errors.id_type}
                        />
                    </FormField>
                    <FormField
                        id="national_id"
                        label="ID number"
                        error={errors.national_id}
                        hint="NIN, passport number, or other ID"
                    >
                        <Input
                            id="national_id"
                            name="national_id"
                            defaultValue={customer?.national_id ?? ''}
                            placeholder="CM12345678ABCDE"
                            aria-invalid={!!errors.national_id}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="id_expiry_date"
                        label="ID expiry date"
                        error={errors.id_expiry_date}
                    >
                        <Input
                            id="id_expiry_date"
                            name="id_expiry_date"
                            type="date"
                            defaultValue={customer?.id_expiry_date ?? ''}
                            aria-invalid={!!errors.id_expiry_date}
                            className="h-10"
                        />
                    </FormField>
                </div>

                <CustomerIdDocumentFields
                    mode={mode}
                    idFrontUrl={customer?.id_front_url}
                    idBackUrl={customer?.id_back_url}
                    errors={errors}
                />
            </FormSection>

            <FormSection
                title="Contact & location"
                description="Phone is required for SMS reminders and mobile money."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="phone"
                        label="Phone number"
                        error={errors.phone}
                        required
                        hint="Include country code, e.g. 2567XXXXXXXX"
                    >
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={customer?.phone ?? ''}
                            required
                            autoComplete="tel"
                            placeholder="256700000000"
                            aria-invalid={!!errors.phone}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="email"
                        label="Email"
                        error={errors.email}
                        hint="Required if the client chooses email reminders"
                    >
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={customer?.email ?? ''}
                            autoComplete="email"
                            placeholder="jane@example.com"
                            aria-invalid={!!errors.email}
                            className="h-10"
                        />
                    </FormField>
                </div>
                <PaymentReminderChannelsField
                    channels={notificationChannels}
                    selected={customer?.payment_reminder_channels ?? ['sms']}
                    errors={errors}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="district"
                        label="District / region"
                        error={errors.district}
                    >
                        <Input
                            id="district"
                            name="district"
                            defaultValue={customer?.district ?? ''}
                            placeholder="Kampala"
                            aria-invalid={!!errors.district}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="city"
                        label="City / town"
                        error={errors.city}
                    >
                        <Input
                            id="city"
                            name="city"
                            defaultValue={customer?.city ?? ''}
                            placeholder="Kampala"
                            aria-invalid={!!errors.city}
                            className="h-10"
                        />
                    </FormField>
                </div>
                <FormField
                    id="address"
                    label="Street address"
                    error={errors.address}
                    hint="Plot, street, or landmark"
                >
                    <Textarea
                        id="address"
                        name="address"
                        defaultValue={customer?.address ?? ''}
                        placeholder="Plot 12, Kampala Road"
                        rows={3}
                        aria-invalid={!!errors.address}
                    />
                </FormField>
            </FormSection>

            <FormSection
                title="Employment & income"
                description="Used for affordability and credit assessment."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="employment_status"
                        label="Employment status"
                        error={errors.employment_status}
                    >
                        <EnumSelect
                            id="employment_status"
                            name="employment_status"
                            options={employmentStatuses}
                            defaultValue={customer?.employment_status}
                            error={errors.employment_status}
                        />
                    </FormField>
                    <FormField
                        id="occupation"
                        label="Occupation / job title"
                        error={errors.occupation}
                    >
                        <Input
                            id="occupation"
                            name="occupation"
                            defaultValue={customer?.occupation ?? ''}
                            placeholder="Shop owner"
                            aria-invalid={!!errors.occupation}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="employer_name"
                        label="Employer / business name"
                        error={errors.employer_name}
                    >
                        <Input
                            id="employer_name"
                            name="employer_name"
                            defaultValue={customer?.employer_name ?? ''}
                            placeholder="Namukasa Retail Ltd"
                            aria-invalid={!!errors.employer_name}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="monthly_income"
                        label="Monthly income"
                        error={errors.monthly_income}
                        hint="Gross monthly income in your org currency"
                    >
                        <Input
                            id="monthly_income"
                            name="monthly_income"
                            type="number"
                            min={0}
                            defaultValue={customer?.monthly_income ?? ''}
                            placeholder="1500000"
                            aria-invalid={!!errors.monthly_income}
                            className="h-10"
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                title="Next of kin"
                description="Emergency contact for collections and verification."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        id="next_of_kin_name"
                        label="Full name"
                        error={errors.next_of_kin_name}
                    >
                        <Input
                            id="next_of_kin_name"
                            name="next_of_kin_name"
                            defaultValue={customer?.next_of_kin_name ?? ''}
                            placeholder="John Namukasa"
                            aria-invalid={!!errors.next_of_kin_name}
                            className="h-10"
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
                            type="tel"
                            defaultValue={customer?.next_of_kin_phone ?? ''}
                            placeholder="256700000001"
                            aria-invalid={!!errors.next_of_kin_phone}
                            className="h-10"
                        />
                    </FormField>
                    <FormField
                        id="next_of_kin_relationship"
                        label="Relationship"
                        error={errors.next_of_kin_relationship}
                    >
                        <Input
                            id="next_of_kin_relationship"
                            name="next_of_kin_relationship"
                            defaultValue={
                                customer?.next_of_kin_relationship ?? ''
                            }
                            placeholder="Spouse, parent, sibling"
                            aria-invalid={!!errors.next_of_kin_relationship}
                            className="h-10"
                        />
                    </FormField>
                </div>
            </FormSection>

            {mode === 'edit' && statuses.length > 0 && (
                <FormSection
                    title="Account status"
                    description="Inactive or blacklisted customers cannot receive new loans."
                >
                    <FormField
                        id="status"
                        label="Status"
                        error={errors.status}
                        required
                    >
                        <NativeSelect
                            id="status"
                            name="status"
                            defaultValue={customer?.status ?? 'active'}
                            required
                            aria-invalid={!!errors.status}
                        >
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>
                </FormSection>
            )}
        </div>
    );
}

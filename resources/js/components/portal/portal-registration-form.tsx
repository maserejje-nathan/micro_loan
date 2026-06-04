import {
    Briefcase,
    Check,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    MapPin,
    Shield,
    User,
    Users,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ComponentType,
    type MouseEvent,
} from 'react';
import { CustomerIdDocumentFields } from '@/components/customers/customer-id-document-fields';
import { FormField } from '@/components/form-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import PasswordInput from '@/components/password-input';
import { cn } from '@/lib/utils';

type SelectOption = { value: string; label: string };

type StepConfig = {
    id: string;
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    optional?: boolean;
};

const BASE_STEPS: StepConfig[] = [
    {
        id: 'account',
        title: 'Account',
        description: 'How you sign in and how we reach you',
        icon: User,
    },
    {
        id: 'profile',
        title: 'Profile',
        description: 'Identity and where you live',
        icon: Shield,
        optional: true,
    },
    {
        id: 'work',
        title: 'Work & contacts',
        description: 'Income and next of kin',
        icon: Briefcase,
        optional: true,
    },
    {
        id: 'review',
        title: 'Review',
        description: 'Confirm and create your account',
        icon: ClipboardCheck,
    },
];

/** Must match `id` on the Inertia `<Form>` in portal/register.tsx */
export const PORTAL_REGISTER_FORM_ID = 'portal-registration-form';

function getPortalRegisterForm(): HTMLFormElement | null {
    const el = document.getElementById(PORTAL_REGISTER_FORM_ID);
    return el instanceof HTMLFormElement ? el : null;
}

const STEP_FIELDS: Record<string, string[]> = {
    account: [
        'organization_slug',
        'first_name',
        'last_name',
        'phone',
        'email',
        'password',
        'password_confirmation',
    ],
    profile: [
        'national_id',
        'id_type',
        'id_front',
        'id_back',
        'date_of_birth',
        'gender',
        'nationality',
        'address',
        'city',
        'district',
    ],
    work: [
        'occupation',
        'employment_status',
        'employer_name',
        'monthly_income',
        'next_of_kin_name',
        'next_of_kin_phone',
        'next_of_kin_relationship',
    ],
};

function findStepForErrors(
    errors: Record<string, string | undefined>,
    steps: StepConfig[],
): number {
    const keys = Object.keys(errors).filter((k) => errors[k]);
    for (let i = 0; i < steps.length; i++) {
        const fields = STEP_FIELDS[steps[i].id] ?? [];
        if (keys.some((key) => fields.includes(key.split('.')[0]))) {
            return i;
        }
    }

    return 0;
}

function validateAccountStep(
    form: HTMLFormElement,
    requiresOrganizationSlug: boolean,
): boolean {
    const required = [
        ...(requiresOrganizationSlug ? ['organization_slug'] : []),
        'first_name',
        'last_name',
        'phone',
        'password',
        'password_confirmation',
    ];

    for (const name of required) {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement && !field.reportValidity()) {
            field.focus();
            return false;
        }
    }

    const password = form.elements.namedItem('password');
    const confirmation = form.elements.namedItem('password_confirmation');

    if (
        password instanceof HTMLInputElement &&
        confirmation instanceof HTMLInputElement
    ) {
        if (password.value !== confirmation.value) {
            confirmation.setCustomValidity('Passwords do not match.');
            confirmation.reportValidity();
            confirmation.focus();
            return false;
        }
        confirmation.setCustomValidity('');
    }

    return true;
}

function validateProfileStep(form: HTMLFormElement): boolean {
    for (const name of ['id_front', 'id_back'] as const) {
        const field = form.elements.namedItem(name);
        if (!(field instanceof HTMLInputElement) || field.type !== 'file') {
            continue;
        }

        if (!field.files?.length) {
            field.setCustomValidity(
                name === 'id_front'
                    ? 'Upload a photo of the front of your ID.'
                    : 'Upload a photo of the back of your ID.',
            );
            field.reportValidity();
            field.focus();
            return false;
        }

        field.setCustomValidity('');
    }

    return true;
}

function hasIdFile(form: HTMLFormElement, name: 'id_front' | 'id_back'): boolean {
    const field = form.elements.namedItem(name);
    return (
        field instanceof HTMLInputElement &&
        field.type === 'file' &&
        (field.files?.length ?? 0) > 0
    );
}

function buildReviewItems(
    form: HTMLFormElement,
    idTypes: SelectOption[],
    employmentStatuses: SelectOption[],
    currency: string,
) {
    const value = (name: string) => {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
            return field.value.trim();
        }
        if (field instanceof HTMLSelectElement) {
            return field.value;
        }
        return '';
    };

    const labelFor = (name: string, options: SelectOption[]) => {
        const v = value(name);
        return options.find((o) => o.value === v)?.label ?? v;
    };

    const items: { label: string; value: string }[] = [
        {
            label: 'Name',
            value: `${value('first_name')} ${value('last_name')}`.trim(),
        },
        { label: 'Phone', value: value('phone') },
    ];

    if (value('email')) {
        items.push({ label: 'Email', value: value('email') });
    }
    if (value('national_id')) {
        items.push({ label: 'National ID', value: value('national_id') });
    }
    if (value('id_type')) {
        items.push({
            label: 'ID type',
            value: labelFor('id_type', idTypes),
        });
    }
    if (hasIdFile(form, 'id_front')) {
        items.push({ label: 'ID front', value: 'Uploaded' });
    }
    if (hasIdFile(form, 'id_back')) {
        items.push({ label: 'ID back', value: 'Uploaded' });
    }
    if (value('address') || value('city')) {
        items.push({
            label: 'Address',
            value: [value('address'), value('city'), value('district')]
                .filter(Boolean)
                .join(', '),
        });
    }
    if (value('occupation') || value('employment_status')) {
        items.push({
            label: 'Employment',
            value: [value('occupation'), labelFor('employment_status', employmentStatuses)]
                .filter(Boolean)
                .join(' · '),
        });
    }
    if (value('monthly_income')) {
        items.push({
            label: 'Monthly income',
            value: `${Number(value('monthly_income')).toLocaleString()} ${currency}`,
        });
    }
    if (value('next_of_kin_name')) {
        items.push({
            label: 'Next of kin',
            value: `${value('next_of_kin_name')} (${value('next_of_kin_relationship') || '—'})`,
        });
    }

    return items.filter((item) => item.value);
}

type PortalRegistrationFormProps = {
    errors: Record<string, string | undefined>;
    requiresOrganizationSlug: boolean;
    organizationSlug?: string;
    organizationName?: string;
    currency?: string;
    genders: SelectOption[];
    idTypes: SelectOption[];
    employmentStatuses: SelectOption[];
    processing: boolean;
};

export function PortalRegistrationForm({
    errors,
    requiresOrganizationSlug,
    organizationSlug,
    organizationName,
    currency = 'UGX',
    genders,
    idTypes,
    employmentStatuses,
    processing,
}: PortalRegistrationFormProps) {
    const [step, setStep] = useState(0);
    const [reviewItems, setReviewItems] = useState<{ label: string; value: string }[]>(
        [],
    );

    const steps = useMemo(() => BASE_STEPS, []);
    const isLastStep = step === steps.length - 1;

    useEffect(() => {
        if (Object.keys(errors).length === 0) {
            return;
        }
        setStep(findStepForErrors(errors, steps));
    }, [errors, steps]);

    useEffect(() => {
        if (steps[step]?.id !== 'review') {
            return;
        }
        const form = getPortalRegisterForm();
        if (!form) {
            return;
        }
        setReviewItems(
            buildReviewItems(form, idTypes, employmentStatuses, currency),
        );
    }, [step, steps, idTypes, employmentStatuses, currency]);

    const goNext = useCallback(() => {
        const form = getPortalRegisterForm();
        if (!form) {
            return;
        }

        if (
            steps[step].id === 'account' &&
            !validateAccountStep(form, requiresOrganizationSlug)
        ) {
            return;
        }

        if (steps[step].id === 'profile' && !validateProfileStep(form)) {
            return;
        }

        const next = Math.min(step + 1, steps.length - 1);
        if (steps[next]?.id === 'review') {
            setReviewItems(
                buildReviewItems(form, idTypes, employmentStatuses, currency),
            );
        }
        setStep(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [
        step,
        steps,
        requiresOrganizationSlug,
        idTypes,
        employmentStatuses,
        currency,
    ]);

    const goBack = () => {
        setStep((s) => Math.max(s - 1, 0));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmitClick = (event: MouseEvent<HTMLButtonElement>) => {
        if (!isLastStep) {
            event.preventDefault();
            goNext();
            return;
        }

        const form = getPortalRegisterForm();
        if (!form) {
            return;
        }

        if (!validateAccountStep(form, requiresOrganizationSlug)) {
            event.preventDefault();
            setStep(0);
            return;
        }

        if (!validateProfileStep(form)) {
            event.preventDefault();
            setStep(1);
        }
    };

    return (
        <div className="space-y-6">
            <nav
                aria-label="Registration progress"
                className="-mx-1 overflow-x-auto overscroll-x-contain pb-1 sm:mx-0 sm:overflow-visible"
            >
                <ol className="flex min-w-[18rem] items-center gap-0.5 sm:min-w-0 sm:gap-2">
                    {steps.map((s, index) => {
                        const Icon = s.icon;
                        const isComplete = index < step;
                        const isCurrent = index === step;

                        return (
                            <li
                                key={s.id}
                                className="flex min-w-[4.25rem] flex-1 items-center gap-0.5 sm:min-w-0 sm:gap-1"
                            >
                                <div
                                    className={cn(
                                        'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-0.5 py-1.5 text-center sm:gap-1.5 sm:px-2 sm:py-2',
                                        isCurrent && 'bg-secondary',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                            isComplete &&
                                                'border-primary bg-primary text-primary-foreground',
                                            isCurrent &&
                                                !isComplete &&
                                                'border-primary text-primary',
                                            !isComplete &&
                                                !isCurrent &&
                                                'border-muted-foreground/25 text-muted-foreground',
                                        )}
                                    >
                                        {isComplete ? (
                                            <Check className="size-4" />
                                        ) : (
                                            <Icon className="size-3.5" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'max-w-full truncate text-[10px] font-medium leading-tight sm:text-xs',
                                            isCurrent
                                                ? 'text-foreground'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {s.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'h-0.5 min-w-2 flex-1 shrink rounded-full',
                                            index < step
                                                ? 'bg-primary'
                                                : 'bg-muted',
                                        )}
                                        aria-hidden
                                    />
                                )}
                            </li>
                        );
                    })}
                </ol>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Step {step + 1} of {steps.length}:{' '}
                    <span className="font-medium text-foreground">
                        {steps[step].title}
                    </span>
                </p>
            </nav>

            <div className="rounded-lg border border-border bg-muted px-4 py-3">
                <p className="text-sm font-medium">{steps[step].title}</p>
                <p className="text-sm text-muted-foreground">
                    {steps[step].description}
                </p>
                {steps[step].optional && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                        Optional — you can skip and complete later
                    </Badge>
                )}
            </div>

            <div className="space-y-6">
                <div className={cn(step !== 0 && 'hidden')} aria-hidden={step !== 0}>
                    <div className="space-y-4">
                        {requiresOrganizationSlug && (
                            <FormField
                                id="organization_slug"
                                label="Lender code"
                                hint="Provided by your microfinance institution"
                                error={errors.organization_slug}
                                required
                            >
                                <Input
                                    id="organization_slug"
                                    name="organization_slug"
                                    defaultValue={organizationSlug}
                                    placeholder="your-company-slug"
                                    autoComplete="organization"
                                    className="h-10"
                                    required
                                />
                            </FormField>
                        )}

                        {organizationName && !requiresOrganizationSlug && (
                            <p className="rounded-md border border-primary/20 bg-secondary px-3 py-2 text-sm">
                                Registering with{' '}
                                <span className="font-medium">{organizationName}</span>
                            </p>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                id="first_name"
                                label="First name"
                                error={errors.first_name}
                                required
                            >
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    autoComplete="given-name"
                                    required
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
                                    autoComplete="family-name"
                                    required
                                    className="h-10"
                                />
                            </FormField>
                            <FormField
                                id="phone"
                                label="Phone number"
                                hint="This is your sign-in ID — use your active mobile number"
                                error={errors.phone}
                                required
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="2567XXXXXXXX"
                                    required
                                    className="h-10"
                                />
                            </FormField>
                            <FormField
                                id="email"
                                label="Email"
                                hint="Optional — for statements and updates"
                                error={errors.email}
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="h-10"
                                />
                            </FormField>
                        </div>

                        <Separator />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                id="password"
                                label="Password"
                                hint="At least 8 characters"
                                error={errors.password}
                                required
                            >
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    required
                                />
                            </FormField>
                            <FormField
                                id="password_confirmation"
                                label="Confirm password"
                                error={errors.password_confirmation}
                                required
                            >
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    required
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                <div className={cn(step !== 1 && 'hidden')} aria-hidden={step !== 1}>
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="size-4 shrink-0 text-primary" />
                        Helps your lender verify your identity for loan applications.
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            id="national_id"
                            label="National ID / NIN"
                            error={errors.national_id}
                        >
                            <Input
                                id="national_id"
                                name="national_id"
                                className="h-10"
                            />
                        </FormField>
                        <FormField id="id_type" label="ID type" error={errors.id_type}>
                            <NativeSelect
                                id="id_type"
                                name="id_type"
                                options={[
                                    { value: '', label: 'Select…' },
                                    ...idTypes,
                                ]}
                            />
                        </FormField>
                        <FormField
                            id="date_of_birth"
                            label="Date of birth"
                            error={errors.date_of_birth}
                        >
                            <Input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                className="h-10"
                            />
                        </FormField>
                        <FormField id="gender" label="Gender" error={errors.gender}>
                            <NativeSelect
                                id="gender"
                                name="gender"
                                options={[
                                    { value: '', label: 'Select…' },
                                    ...genders,
                                ]}
                            />
                        </FormField>
                        <FormField
                            id="nationality"
                            label="Nationality"
                            error={errors.nationality}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="nationality"
                                name="nationality"
                                defaultValue="Ugandan"
                                className="h-10"
                            />
                        </FormField>
                    </div>

                    <div className="mt-6">
                        <CustomerIdDocumentFields
                            mode="create"
                            required
                            errors={errors}
                        />
                    </div>

                    <Separator className="my-6" />

                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4 shrink-0 text-primary" />
                        Your residential address
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            id="address"
                            label="Street address"
                            error={errors.address}
                            className="sm:col-span-2"
                        >
                            <Textarea
                                id="address"
                                name="address"
                                rows={2}
                                placeholder="Plot number, street, parish"
                            />
                        </FormField>
                        <FormField id="city" label="City / town" error={errors.city}>
                            <Input
                                id="city"
                                name="city"
                                placeholder="Kampala"
                                className="h-10"
                            />
                        </FormField>
                        <FormField id="district" label="District" error={errors.district}>
                            <Input
                                id="district"
                                name="district"
                                className="h-10"
                            />
                        </FormField>
                    </div>
                </div>

                <div className={cn(step !== 2 && 'hidden')} aria-hidden={step !== 2}>
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="size-4 shrink-0 text-primary" />
                        Used to assess affordability when you apply for a loan.
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            id="occupation"
                            label="Occupation"
                            error={errors.occupation}
                        >
                            <Input
                                id="occupation"
                                name="occupation"
                                placeholder="e.g. Shop owner"
                                className="h-10"
                            />
                        </FormField>
                        <FormField
                            id="employment_status"
                            label="Employment status"
                            error={errors.employment_status}
                        >
                            <NativeSelect
                                id="employment_status"
                                name="employment_status"
                                options={[
                                    { value: '', label: 'Select…' },
                                    ...employmentStatuses,
                                ]}
                            />
                        </FormField>
                        <FormField
                            id="employer_name"
                            label="Employer or business name"
                            error={errors.employer_name}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="employer_name"
                                name="employer_name"
                                className="h-10"
                            />
                        </FormField>
                        <FormField
                            id="monthly_income"
                            label={`Monthly income (${currency})`}
                            hint="Approximate gross income per month"
                            error={errors.monthly_income}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="monthly_income"
                                name="monthly_income"
                                type="number"
                                min={0}
                                step={10000}
                                placeholder="0"
                                className="h-10"
                            />
                        </FormField>
                    </div>

                    <Separator className="my-6" />

                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="size-4 shrink-0 text-primary" />
                        Emergency contact
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            id="next_of_kin_name"
                            label="Full name"
                            error={errors.next_of_kin_name}
                        >
                            <Input
                                id="next_of_kin_name"
                                name="next_of_kin_name"
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
                                inputMode="tel"
                                className="h-10"
                            />
                        </FormField>
                        <FormField
                            id="next_of_kin_relationship"
                            label="Relationship"
                            error={errors.next_of_kin_relationship}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="next_of_kin_relationship"
                                name="next_of_kin_relationship"
                                placeholder="e.g. Spouse, Parent, Sibling"
                                className="h-10"
                            />
                        </FormField>
                    </div>
                </div>

                <div className={cn(step !== 3 && 'hidden')} aria-hidden={step !== 3}>
                    <ReviewPanel
                        items={reviewItems}
                        organizationName={organizationName}
                        onEdit={setStep}
                    />
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        'w-full sm:w-auto',
                        step === 0 && 'hidden sm:invisible',
                    )}
                    onClick={goBack}
                    disabled={processing || step === 0}
                >
                    <ChevronLeft className="mr-1 size-4" />
                    Back
                </Button>

                {isLastStep ? (
                    <Button
                        type="submit"
                        className="w-full sm:w-auto sm:min-w-[160px]"
                        disabled={processing}
                        onClick={handleSubmitClick}
                    >
                        {processing ? 'Creating account…' : 'Create account'}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="w-full sm:w-auto sm:min-w-[160px]"
                        disabled={processing}
                        onClick={goNext}
                    >
                        Continue
                        <ChevronRight className="ml-1 size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function ReviewPanel({
    items,
    organizationName,
    onEdit,
}: {
    items: { label: string; value: string }[];
    organizationName?: string;
    onEdit: (step: number) => void;
}) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Check your details before submitting. You can update your profile
                anytime after signing in.
            </p>

            {organizationName && (
                <p className="rounded-md border bg-muted px-3 py-2 text-sm">
                    Lender: <span className="font-medium">{organizationName}</span>
                </p>
            )}

            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                    Go back to complete previous steps, then return here to review.
                </p>
            ) : (
                <dl className="grid gap-2 sm:grid-cols-2">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-lg border bg-card px-3 py-2.5"
                        >
                            <dt className="text-xs text-muted-foreground">
                                {item.label}
                            </dt>
                            <dd className="mt-0.5 text-sm font-medium break-words">
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(0)}
                >
                    Edit account
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(1)}
                >
                    Edit profile
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(2)}
                >
                    Edit work & contacts
                </Button>
            </div>
        </div>
    );
}

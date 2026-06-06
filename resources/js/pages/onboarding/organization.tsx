import { Form, Head } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { FormActions } from '@/components/form-actions';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/onboarding/organization';

export default function OrganizationOnboarding() {
    return (
        <>
            <Head title="Set up your company" />
            <div className="flex min-h-svh w-full flex-col justify-center p-6 lg:p-10">
                <div className="mb-8 max-w-3xl">
                    <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Building2 className="size-6" />
                    </span>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Set up your lending company
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground text-pretty">
                        Create your organization workspace. You will be the owner
                        with full access to manage loans and settings.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Company details</CardTitle>
                        <CardDescription>
                            You can invite team members after setup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...store.form()}
                            disableWhileProcessing
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <FormField
                                        id="name"
                                        label="Company name"
                                        error={errors.name}
                                        required
                                        hint="This appears on statements and reports"
                                    >
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            autoFocus
                                            placeholder="Acme Microfinance"
                                            aria-invalid={!!errors.name}
                                            className="h-10"
                                        />
                                    </FormField>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {processing && <Spinner />}
                                        Create workspace
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

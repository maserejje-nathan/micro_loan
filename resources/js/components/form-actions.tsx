import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type FormActionsProps = {
    processing: boolean;
    cancelHref: string;
    submitLabel: string;
    cancelLabel?: string;
    extra?: ReactNode;
};

export function FormActions({
    processing,
    cancelHref,
    submitLabel,
    cancelLabel = 'Cancel',
    extra,
}: FormActionsProps) {
    return (
        <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            {extra}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" asChild>
                    <Link href={cancelHref}>{cancelLabel}</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-32"
                >
                    {processing && <Spinner />}
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}

import { CreditCard } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type IdDocumentSlotProps = {
    id: 'id_front' | 'id_back';
    label: string;
    imageUrl?: string | null;
    error?: string;
    required?: boolean;
    mode: 'create' | 'edit';
};

function IdDocumentSlot({
    id,
    label,
    imageUrl,
    error,
    required = false,
    mode,
}: IdDocumentSlotProps) {
    const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
    const [removeImage, setRemoveImage] = useState(false);
    const objectUrlRef = useRef<string | null>(null);
    const removeFieldName =
        id === 'id_front' ? 'remove_id_front' : 'remove_id_back';

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    const showPreview = preview && !removeImage;

    return (
        <div className="space-y-3">
            <div
                className={cn(
                    'flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted',
                    showPreview && 'border-border',
                )}
            >
                {showPreview ? (
                    <img
                        src={preview}
                        alt={`${label} preview`}
                        className="size-full object-contain"
                    />
                ) : (
                    <CreditCard className="size-10 text-muted-foreground/50" />
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor={id}>{label}</Label>
                <Input
                    id={id}
                    name={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required={required && mode === 'create' && !imageUrl}
                            className="h-10 max-w-full cursor-pointer file:cursor-pointer"
                    aria-invalid={!!error}
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                            return;
                        }

                        if (objectUrlRef.current) {
                            URL.revokeObjectURL(objectUrlRef.current);
                        }

                        const url = URL.createObjectURL(file);
                        objectUrlRef.current = url;
                        setPreview(url);
                        setRemoveImage(false);
                    }}
                />
                <InputError message={error} />
            </div>

            {mode === 'edit' && imageUrl && (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name={removeFieldName}
                        value="1"
                        checked={removeImage}
                        className="size-4 rounded border-input"
                        onChange={(event) => {
                            const checked = event.target.checked;
                            setRemoveImage(checked);

                            if (checked) {
                                setPreview(null);
                            } else {
                                setPreview(imageUrl);
                            }
                        }}
                    />
                    <span>Remove current {label.toLowerCase()}</span>
                </label>
            )}
        </div>
    );
}

type CustomerIdDocumentFieldsProps = {
    idFrontUrl?: string | null;
    idBackUrl?: string | null;
    errors: Record<string, string | undefined>;
    mode: 'create' | 'edit';
    required?: boolean;
};

export function CustomerIdDocumentFields({
    idFrontUrl,
    idBackUrl,
    errors,
    mode,
    required = false,
}: CustomerIdDocumentFieldsProps) {
    return (
        <section className="space-y-4">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    ID document images
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Clear photos of the front and back of your government-issued ID.
                    JPEG, PNG, or WebP up to 5 MB each.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <IdDocumentSlot
                    id="id_front"
                    label="ID front"
                    imageUrl={idFrontUrl}
                    error={errors.id_front}
                    required={required}
                    mode={mode}
                />
                <IdDocumentSlot
                    id="id_back"
                    label="ID back"
                    imageUrl={idBackUrl}
                    error={errors.id_back}
                    required={required}
                    mode={mode}
                />
            </div>
        </section>
    );
}

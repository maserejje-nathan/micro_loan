import { Camera, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type CustomerPhotoFieldProps = {
    photoUrl?: string | null;
    error?: string;
    mode: 'create' | 'edit';
};

export function CustomerPhotoField({
    photoUrl,
    error,
    mode,
}: CustomerPhotoFieldProps) {
    const [preview, setPreview] = useState<string | null>(photoUrl ?? null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    const showPreview = preview && !removePhoto;

    return (
        <section className="space-y-4">
            <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Customer photo
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Passport-style photo for KYC. JPEG, PNG, or WebP up to 2 MB.
                </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                    className={cn(
                        'flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted',
                        showPreview && 'border-border',
                    )}
                >
                    {showPreview ? (
                        <img
                            src={preview}
                            alt="Customer photo preview"
                            className="size-full object-cover"
                        />
                    ) : (
                        <User className="size-12 text-muted-foreground/50" />
                    )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="photo"
                            className="flex items-center gap-2"
                        >
                            <Camera className="size-4" />
                            {mode === 'edit' && photoUrl
                                ? 'Upload new photo'
                                : 'Upload photo'}
                        </Label>
                        <Input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="h-10 cursor-pointer file:cursor-pointer"
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
                                setRemovePhoto(false);
                            }}
                        />
                        <InputError message={error} />
                    </div>

                    {mode === 'edit' && photoUrl && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="remove_photo"
                                value="1"
                                checked={removePhoto}
                                className="size-4 rounded border-input"
                                onChange={(event) => {
                                    const checked = event.target.checked;
                                    setRemovePhoto(checked);

                                    if (checked) {
                                        setPreview(null);
                                    } else {
                                        setPreview(photoUrl);
                                    }
                                }}
                            />
                            <span>Remove current photo</span>
                        </label>
                    )}
                </div>
            </div>
        </section>
    );
}

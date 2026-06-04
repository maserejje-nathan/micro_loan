import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type PlatformLogoFieldProps = {
    previewUrl?: string | null;
    logoUrl?: string;
    storedPath?: string | null;
    imageError?: string;
    logoUrlError?: string;
};

export function PlatformLogoField({
    previewUrl,
    logoUrl = '',
    storedPath,
    imageError,
    logoUrlError,
}: PlatformLogoFieldProps) {
    const [preview, setPreview] = useState<string | null>(previewUrl ?? null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        setPreview(previewUrl ?? null);
        setRemoveLogo(false);
    }, [previewUrl]);

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    const showPreview = preview && !removeLogo;

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Application logo
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Shown in the header, sidebars, auth pages, and welcome page.
                    Square or wide logos work best. PNG or SVG with transparent
                    background recommended.
                </p>
            </div>

            {storedPath && (
                <input type="hidden" name="logo_path" value={storedPath} />
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                    className={cn(
                        'flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted p-2',
                        showPreview && 'border-border',
                    )}
                >
                    {showPreview ? (
                        <img
                            src={preview}
                            alt="Logo preview"
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            No logo
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-2">
                        <Label htmlFor="logo">Upload logo</Label>
                        <Input
                            id="logo"
                            name="logo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            className="h-10 cursor-pointer file:cursor-pointer"
                            aria-invalid={!!imageError}
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
                                setRemoveLogo(false);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            JPEG, PNG, WebP, or SVG up to 2 MB.
                        </p>
                        <InputError message={imageError} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="logo_url">Or logo URL / path</Label>
                        <Input
                            id="logo_url"
                            name="logo_url"
                            defaultValue={logoUrl}
                            placeholder="/images/logo.svg"
                            className="h-10"
                            aria-invalid={!!logoUrlError}
                        />
                        <InputError message={logoUrlError} />
                    </div>

                    {previewUrl && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="remove_logo"
                                value="1"
                                checked={removeLogo}
                                className="size-4 rounded border-input"
                                onChange={(event) => {
                                    const checked = event.target.checked;
                                    setRemoveLogo(checked);
                                    setPreview(checked ? null : previewUrl);
                                }}
                            />
                            <span>Remove current logo</span>
                        </label>
                    )}
                </div>
            </div>
        </section>
    );
}

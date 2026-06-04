import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type WelcomeBannerSlideFieldProps = {
    index: number;
    previewUrl?: string | null;
    imageUrl?: string;
    storedPath?: string | null;
    alt: string;
    caption: string;
    imageError?: string;
    imageUrlError?: string;
};

export function WelcomeBannerSlideField({
    index,
    previewUrl,
    imageUrl = '',
    storedPath,
    alt,
    caption,
    imageError,
    imageUrlError,
}: WelcomeBannerSlideFieldProps) {
    const [preview, setPreview] = useState<string | null>(previewUrl ?? null);
    const [removeImage, setRemoveImage] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        setPreview(previewUrl ?? null);
        setRemoveImage(false);
    }, [previewUrl]);

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    const showPreview = preview && !removeImage;

    return (
        <div className="grid gap-4 rounded-lg border p-4">
            <p className="text-sm font-medium">Slide {index + 1}</p>

            {storedPath && (
                <input
                    type="hidden"
                    name={`banner_slides[${index}][path]`}
                    value={storedPath}
                />
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div
                    className={cn(
                        'relative aspect-[21/7] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted lg:max-w-md',
                        showPreview && 'border-border',
                    )}
                >
                    {showPreview ? (
                        <img
                            src={preview}
                            alt={alt || `Slide ${index + 1} preview`}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full min-h-[120px] items-center justify-center">
                            <ImageIcon className="size-10 text-muted-foreground/40" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`banner_slides_${index}_image`}>
                            Upload image
                        </Label>
                        <Input
                            id={`banner_slides_${index}_image`}
                            name={`banner_slides[${index}][image]`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
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
                                setRemoveImage(false);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            JPEG, PNG, or WebP up to 4 MB. Recommended wide
                            banner (21:7).
                        </p>
                        <InputError message={imageError} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`banner_slides_${index}_image_url`}>
                            Or image URL / path
                        </Label>
                        <Input
                            id={`banner_slides_${index}_image_url`}
                            name={`banner_slides[${index}][image_url]`}
                            defaultValue={imageUrl}
                            placeholder="/images/welcome/banner.svg"
                            className="h-10"
                            aria-invalid={!!imageUrlError}
                        />
                        <InputError message={imageUrlError} />
                    </div>

                    {previewUrl && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name={`banner_slides[${index}][remove_image]`}
                                value="1"
                                checked={removeImage}
                                className="size-4 rounded border-input"
                                onChange={(event) => {
                                    const checked = event.target.checked;
                                    setRemoveImage(checked);
                                    setPreview(checked ? null : previewUrl);
                                }}
                            />
                            <span>Remove current image</span>
                        </label>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`banner_slides_${index}_alt`}>Alt text</Label>
                    <Input
                        id={`banner_slides_${index}_alt`}
                        name={`banner_slides[${index}][alt]`}
                        defaultValue={alt}
                        required
                        className="h-10"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`banner_slides_${index}_caption`}>
                        Caption (optional)
                    </Label>
                    <Input
                        id={`banner_slides_${index}_caption`}
                        name={`banner_slides[${index}][caption]`}
                        defaultValue={caption}
                        className="h-10"
                    />
                </div>
            </div>
        </div>
    );
}

<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WelcomeBannerService
{
    private const string Disk = 'public';

    private const string Directory = 'welcome-banners';

    /**
     * @param  array<int, array<string, mixed>>  $slides
     * @return array<int, array{image_url: string, alt: string, caption: string|null}>
     */
    public function resolveForPublic(array $slides): array
    {
        return collect($slides)
            ->map(fn (array $slide) => [
                'image_url' => $this->resolveImageUrl($slide),
                'alt' => (string) ($slide['alt'] ?? ''),
                'caption' => filled($slide['caption'] ?? null) ? (string) $slide['caption'] : null,
            ])
            ->filter(fn (array $slide) => $slide['image_url'] !== '')
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $slides
     * @return array<int, array{image_url: string, path: string|null, preview_url: string|null, alt: string, caption: string}>
     */
    public function slidesForAdmin(array $slides): array
    {
        return collect($slides)
            ->map(fn (array $slide) => [
                'image_url' => (string) ($slide['image_url'] ?? ''),
                'path' => filled($slide['path'] ?? null) ? (string) $slide['path'] : null,
                'preview_url' => $this->resolveImageUrl($slide) ?: null,
                'alt' => (string) ($slide['alt'] ?? ''),
                'caption' => (string) ($slide['caption'] ?? ''),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $submitted
     * @param  array<string, mixed>  $files
     * @param  array<int, array<string, mixed>>  $existingSlides
     * @return array<int, array<string, mixed>>
     */
    public function mergeSlidesFromRequest(array $submitted, array $files, array $existingSlides): array
    {
        $bannerFiles = is_array($files['banner_slides'] ?? null) ? $files['banner_slides'] : [];

        return collect($submitted)
            ->map(function (array $slide, int $index) use ($bannerFiles, $existingSlides) {
                $existing = $existingSlides[$index] ?? [];
                $uploaded = $bannerFiles[$index]['image'] ?? null;
                $removeImage = filter_var($slide['remove_image'] ?? false, FILTER_VALIDATE_BOOLEAN);

                $merged = [
                    'alt' => $slide['alt'],
                    'caption' => $slide['caption'] ?? null,
                ];

                if ($uploaded instanceof UploadedFile) {
                    $this->deleteStoredFile($existing['path'] ?? null);
                    $merged['path'] = $this->store($index, $uploaded);

                    return $merged;
                }

                if ($removeImage) {
                    $this->deleteStoredFile($existing['path'] ?? null);

                    $imageUrl = trim((string) ($slide['image_url'] ?? ''));

                    return $imageUrl !== ''
                        ? [...$merged, 'image_url' => $imageUrl]
                        : $merged;
                }

                $imageUrl = trim((string) ($slide['image_url'] ?? ''));
                if ($imageUrl !== '') {
                    $this->deleteStoredFile($existing['path'] ?? null);

                    return [...$merged, 'image_url' => $imageUrl];
                }

                $path = trim((string) ($slide['path'] ?? ''));
                if ($path !== '' && Storage::disk(self::Disk)->exists($path)) {
                    return [...$merged, 'path' => $path];
                }

                if (filled($existing['path'] ?? null)) {
                    return [...$merged, 'path' => $existing['path']];
                }

                if (filled($existing['image_url'] ?? null)) {
                    return [...$merged, 'image_url' => $existing['image_url']];
                }

                return $merged;
            })
            ->values()
            ->all();
    }

    public function store(int $index, UploadedFile $file): string
    {
        $extension = $file->extension() ?: $file->guessClientExtension() ?: 'jpg';
        $filename = sprintf('slide-%d-%s.%s', $index + 1, Str::lower(Str::random(8)), $extension);

        return $file->storeAs(self::Directory, $filename, self::Disk);
    }

    /**
     * @param  array<string, mixed>  $slide
     */
    public function resolveImageUrl(array $slide): string
    {
        $path = $slide['path'] ?? null;
        if (is_string($path) && $path !== '' && Storage::disk(self::Disk)->exists($path)) {
            return Storage::disk(self::Disk)->url($path);
        }

        $imageUrl = $slide['image_url'] ?? null;
        if (is_string($imageUrl) && $imageUrl !== '') {
            if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
                return $imageUrl;
            }

            return str_starts_with($imageUrl, '/') ? asset($imageUrl) : asset('/'.$imageUrl);
        }

        return '';
    }

    protected function deleteStoredFile(mixed $path): void
    {
        if (! is_string($path) || $path === '') {
            return;
        }

        if (Storage::disk(self::Disk)->exists($path)) {
            Storage::disk(self::Disk)->delete($path);
        }
    }
}

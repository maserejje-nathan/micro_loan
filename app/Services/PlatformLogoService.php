<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PlatformLogoService
{
    private const string Disk = 'public';

    private const string Directory = 'welcome';

    /**
     * @param  array<string, mixed>  $welcome
     */
    public function resolve(array $welcome): ?string
    {
        $path = $welcome['logo_path'] ?? null;
        if (is_string($path) && $path !== '' && Storage::disk(self::Disk)->exists($path)) {
            return Storage::disk(self::Disk)->url($path);
        }

        $logoUrl = $welcome['logo_url'] ?? null;
        if (is_string($logoUrl) && $logoUrl !== '') {
            if (str_starts_with($logoUrl, 'http://') || str_starts_with($logoUrl, 'https://')) {
                return $logoUrl;
            }

            return str_starts_with($logoUrl, '/') ? asset($logoUrl) : asset('/'.$logoUrl);
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $welcome
     * @return array{logo_url: string, path: string|null, preview_url: string|null}
     */
    public function forAdmin(array $welcome): array
    {
        return [
            'logo_url' => (string) ($welcome['logo_url'] ?? ''),
            'path' => filled($welcome['logo_path'] ?? null) ? (string) $welcome['logo_path'] : null,
            'preview_url' => $this->resolve($welcome),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array<string, mixed>  $existingWelcome
     * @return array<string, mixed>
     */
    public function mergeIntoWelcomeSettings(array $validated, Request $request, array $existingWelcome): array
    {
        $uploaded = $request->file('logo');
        $removeLogo = filter_var($request->input('remove_logo', false), FILTER_VALIDATE_BOOLEAN);
        $logoUrl = trim((string) ($request->input('logo_url', '')));

        if ($uploaded instanceof UploadedFile) {
            $this->deleteStoredFile($existingWelcome['logo_path'] ?? null);
            $validated['logo_path'] = $this->store($uploaded);
            unset($validated['logo_url']);

            return $validated;
        }

        if ($removeLogo) {
            $this->deleteStoredFile($existingWelcome['logo_path'] ?? null);
            unset($validated['logo_path']);

            if ($logoUrl !== '') {
                $validated['logo_url'] = $logoUrl;
            } else {
                unset($validated['logo_url']);
            }

            return $validated;
        }

        if ($logoUrl !== '') {
            $this->deleteStoredFile($existingWelcome['logo_path'] ?? null);
            $validated['logo_url'] = $logoUrl;
            unset($validated['logo_path']);

            return $validated;
        }

        $path = trim((string) ($request->input('logo_path', '')));
        if ($path !== '' && Storage::disk(self::Disk)->exists($path)) {
            $validated['logo_path'] = $path;
            unset($validated['logo_url']);

            return $validated;
        }

        if (filled($existingWelcome['logo_path'] ?? null)) {
            $validated['logo_path'] = $existingWelcome['logo_path'];
            unset($validated['logo_url']);

            return $validated;
        }

        if (filled($existingWelcome['logo_url'] ?? null)) {
            $validated['logo_url'] = $existingWelcome['logo_url'];
        }

        unset($validated['logo'], $validated['remove_logo']);

        return $validated;
    }

    public function store(UploadedFile $file): string
    {
        $extension = $file->extension() ?: $file->guessClientExtension() ?: 'png';
        $filename = 'logo-'.Str::lower(Str::random(8)).'.'.$extension;

        return $file->storeAs(self::Directory, $filename, self::Disk);
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

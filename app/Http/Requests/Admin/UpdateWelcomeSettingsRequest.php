<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateWelcomeSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_super_admin ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'meta_title' => ['required', 'string', 'max:255'],
            'hero_badge' => ['required', 'string', 'max:255'],
            'hero_headline_prefix' => ['required', 'string', 'max:255'],
            'hero_headline_highlight' => ['required', 'string', 'max:255'],
            'hero_description' => ['required', 'string', 'max:2000'],
            'hero_primary_cta' => ['required', 'string', 'max:100'],
            'hero_secondary_cta' => ['required', 'string', 'max:100'],
            'highlights' => ['required', 'array', 'min:1'],
            'highlights.*' => ['required', 'string', 'max:255'],
            'cta_title' => ['required', 'string', 'max:255'],
            'cta_description' => ['required', 'string', 'max:1000'],
            'footer_tagline' => ['required', 'string', 'max:1000'],
            'mobile_app_title' => ['required', 'string', 'max:255'],
            'mobile_app_description' => ['required', 'string', 'max:1000'],
            'ios_app_url' => ['nullable', 'url', 'max:500'],
            'android_app_url' => ['nullable', 'url', 'max:500'],
            'popular_plan_slug' => ['nullable', 'string', 'max:100'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'logo_path' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,svg', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'],
            'banner_slides' => ['nullable', 'array', 'max:8'],
            'banner_slides.*.image_url' => ['nullable', 'string', 'max:500'],
            'banner_slides.*.path' => ['nullable', 'string', 'max:500'],
            'banner_slides.*.image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:4096'],
            'banner_slides.*.remove_image' => ['sometimes', 'boolean'],
            'banner_slides.*.alt' => ['required', 'string', 'max:255'],
            'banner_slides.*.caption' => ['nullable', 'string', 'max:255'],
            'steps' => ['required', 'array', 'min:1'],
            'steps.*.title' => ['required', 'string', 'max:255'],
            'steps.*.description' => ['required', 'string', 'max:1000'],
            'features' => ['required', 'array', 'min:1'],
            'features.*.title' => ['required', 'string', 'max:255'],
            'features.*.description' => ['required', 'string', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ($this->input('banner_slides', []) as $index => $slide) {
                if (! is_array($slide)) {
                    continue;
                }

                $hasUpload = $this->hasFile("banner_slides.{$index}.image");
                $hasPath = filled($slide['path'] ?? null);
                $hasUrl = filled(trim((string) ($slide['image_url'] ?? '')));
                $removeImage = filter_var($slide['remove_image'] ?? false, FILTER_VALIDATE_BOOLEAN);

                if (! $hasUpload && ! $hasPath && ! $hasUrl && $removeImage) {
                    $validator->errors()->add(
                        "banner_slides.{$index}.image",
                        'Upload an image or provide an image URL.',
                    );
                }

                if (! $hasUpload && ! $hasPath && ! $hasUrl && ! $removeImage) {
                    $validator->errors()->add(
                        "banner_slides.{$index}.image",
                        'Each slide requires an image.',
                    );
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('remove_logo')) {
            $this->merge([
                'remove_logo' => filter_var($this->input('remove_logo'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        foreach (['ios_app_url', 'android_app_url'] as $field) {
            if ($this->has($field) && blank($this->input($field))) {
                $this->merge([$field => null]);
            }
        }

        $slides = $this->input('banner_slides', []);

        if (! is_array($slides)) {
            return;
        }

        foreach ($slides as $index => $slide) {
            if (! is_array($slide)) {
                continue;
            }

            if ($this->has("banner_slides.{$index}.remove_image")) {
                $slides[$index]['remove_image'] = filter_var(
                    $slide['remove_image'] ?? false,
                    FILTER_VALIDATE_BOOLEAN,
                );
            }
        }

        $this->merge(['banner_slides' => $slides]);
    }
}

<?php

namespace App\Http\Requests\Concerns;

trait ValidatesCustomerPhoto
{
    /**
     * @return array<string, mixed>
     */
    protected function customerPhotoRules(): array
    {
        return [
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }

    protected function preparePhotoForValidation(): void
    {
        if ($this->has('remove_photo')) {
            $this->merge([
                'remove_photo' => filter_var($this->input('remove_photo'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function customerPhotoUpdateRules(): array
    {
        return [
            ...$this->customerPhotoRules(),
            'remove_photo' => ['sometimes', 'boolean'],
        ];
    }
}

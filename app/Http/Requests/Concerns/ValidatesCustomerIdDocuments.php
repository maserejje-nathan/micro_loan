<?php

namespace App\Http\Requests\Concerns;

trait ValidatesCustomerIdDocuments
{
    /**
     * @return array<string, mixed>
     */
    protected function customerIdDocumentRules(bool $required = false): array
    {
        $rule = $required ? 'required' : 'nullable';

        return [
            'id_front' => [$rule, 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'id_back' => [$rule, 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }

    protected function prepareIdDocumentForValidation(): void
    {
        foreach (['remove_id_front', 'remove_id_back'] as $field) {
            if ($this->has($field)) {
                $this->merge([
                    $field => filter_var($this->input($field), FILTER_VALIDATE_BOOLEAN),
                ]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function customerIdDocumentUpdateRules(): array
    {
        return [
            ...$this->customerIdDocumentRules(),
            'remove_id_front' => ['sometimes', 'boolean'],
            'remove_id_back' => ['sometimes', 'boolean'],
        ];
    }
}

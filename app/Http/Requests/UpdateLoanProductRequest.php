<?php

namespace App\Http\Requests;

class UpdateLoanProductRequest extends StoreLoanProductRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['code'] = ['required', 'string', 'max:50', 'alpha_dash'];

        return $rules;
    }
}

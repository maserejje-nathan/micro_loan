<?php

namespace App\Http\Requests\Portal;

use App\Http\Requests\Concerns\ValidatesLoanApplicationCollaterals;
use App\Models\Customer;
use App\Models\LoanProduct;
use App\Support\LoanProductLimitValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PortalStoreLoanApplicationRequest extends FormRequest
{
    use ValidatesLoanApplicationCollaterals;

    public function authorize(): bool
    {
        return $this->user('portal') instanceof Customer
            || $this->user() instanceof Customer;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'loan_product_id' => ['required', 'exists:loan_products,id'],
            'requested_amount' => ['required', 'integer', 'min:1'],
            'term_days' => ['required', 'integer', 'min:1'],
            'purpose' => ['nullable', 'string', 'max:1000'],
            ...$this->collateralRules(),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $product = LoanProduct::query()->find($this->input('loan_product_id'));

            if ($product === null) {
                return;
            }

            $errors = LoanProductLimitValidator::errors(
                $product,
                (int) $this->input('requested_amount'),
                (int) $this->input('term_days'),
            );

            foreach ($errors as $field => $message) {
                $validator->errors()->add($field === 'amount' ? 'requested_amount' : $field, $message);
            }
        });
    }
}

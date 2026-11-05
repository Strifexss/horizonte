<?php

namespace App\Http\Requests;

use App\Modulos;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CopilotoInteresseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'modulo' => ['required', 'string', Rule::in(array_keys(Modulos::OPCIONAIS))],
        ];
    }
}

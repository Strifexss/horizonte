<?php

namespace App\Http\Requests;

use App\Modulos;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmpresaModulosRequest extends FormRequest
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
            'segmento_id' => ['required', 'integer', 'exists:segmentos,id'],
            'ajustes' => ['array'],
            'ajustes.*' => ['string', Rule::in(['herdar', 'ligar', 'desligar'])],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator): void {
                $desconhecidos = array_diff(array_keys($this->input('ajustes', [])), array_keys(Modulos::OPCIONAIS));

                if ($desconhecidos !== []) {
                    $validator->errors()->add('ajustes', 'Módulo desconhecido.');
                }
            },
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Models\InsightAcao;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InsightAcaoRequest extends FormRequest
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
            'chave' => ['required', 'string', 'max:40'],
            'acao' => ['required', 'string', Rule::in([InsightAcao::ACAO_FEITO, InsightAcao::ACAO_DISPENSADO])],
            'motivo' => ['nullable', 'string', Rule::in(InsightAcao::MOTIVOS)],
        ];
    }
}

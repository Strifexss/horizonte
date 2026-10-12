<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class DashboardSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string|ValidationRule>>
     */
    public function rules(): array
    {
        return [
            'data_inicio' => ['nullable', 'date', 'required_with:data_fim'],
            'data_fim' => ['nullable', 'date', 'required_with:data_inicio', 'after_or_equal:data_inicio'],
            'grupo_data_inicio' => ['nullable', 'date', 'required_with:grupo_data_fim'],
            'grupo_data_fim' => ['nullable', 'date', 'required_with:grupo_data_inicio', 'after_or_equal:grupo_data_inicio'],
            'mes_receitas' => ['nullable', 'date_format:Y-m'],
            'semana_receitas' => ['nullable', 'date'],
        ];
    }

    /**
     * @return list<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $semanaInput = $this->input('semana_receitas');

                if (! is_string($semanaInput) || trim($semanaInput) === '') {
                    return;
                }

                $semana = Carbon::parse($semanaInput)->startOfDay();

                if ($semana->dayOfWeek !== Carbon::MONDAY) {
                    $validator->errors()->add(
                        'semana_receitas',
                        'A semana deve começar em uma segunda-feira.',
                    );

                    return;
                }

                $mesInput = $this->input('mes_receitas');

                if (! is_string($mesInput) || trim($mesInput) === '') {
                    return;
                }

                $inicioMes = Carbon::createFromFormat('!Y-m', $mesInput);

                if ($inicioMes === false) {
                    return;
                }

                $inicioMes = $inicioMes->startOfMonth();
                $fimMes = $inicioMes->copy()->endOfMonth();
                $fimSemana = $semana->copy()->addDays(6);

                if ($semana->gt($fimMes) || $fimSemana->lt($inicioMes)) {
                    $validator->errors()->add(
                        'semana_receitas',
                        'A semana deve cruzar o mês selecionado.',
                    );
                }
            },
        ];
    }
}

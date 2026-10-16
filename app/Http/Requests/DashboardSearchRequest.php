<?php

namespace App\Http\Requests;

use App\DTO\DashboardSearchDTO;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;

class DashboardSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string|ValidationRule|In>>
     */
    public function rules(): array
    {
        $anoAtual = (int) now()->year;

        return [
            'ano' => [
                'nullable',
                'integer',
                'min:'.($anoAtual - DashboardSearchDTO::ANOS_ANTES),
                'max:'.($anoAtual + DashboardSearchDTO::ANOS_DEPOIS),
            ],
            'mes' => ['nullable', 'integer', 'between:1,12'],
            'semana' => ['nullable', 'date'],
            'ranking_criterio' => ['nullable', 'string', Rule::in(DashboardSearchDTO::CRITERIOS_RANKING)],
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

                $semanaInput = $this->input('semana');

                if (! is_string($semanaInput) || trim($semanaInput) === '') {
                    return;
                }

                $semana = Carbon::parse($semanaInput)->startOfDay();

                if ($semana->dayOfWeek !== Carbon::MONDAY) {
                    $validator->errors()->add('semana', 'A semana deve começar em uma segunda-feira.');

                    return;
                }

                $inicioMes = Carbon::create(
                    (int) ($this->input('ano') ?: now()->year),
                    (int) ($this->input('mes') ?: now()->month),
                    1,
                )->startOfDay();
                $fimMes = $inicioMes->copy()->endOfMonth();

                if ($semana->gt($fimMes) || $semana->copy()->addDays(6)->lt($inicioMes)) {
                    $validator->errors()->add('semana', 'A semana deve cruzar o mês do período de referência.');
                }
            },
        ];
    }
}

<?php

namespace App\DTO;

class DashboardSearchDTO extends Dto
{
    /**
     * @var list<string>
     */
    public const CRITERIOS_RANKING = [
        'produtos',
        'fornecedores',
        'categorias_despesa',
        'categorias_receita',
    ];

    /**
     * Quantos anos antes e depois do atual o Período de referência aceita.
     */
    public const ANOS_ANTES = 5;

    public const ANOS_DEPOIS = 1;

    public ?int $ano = null;

    public ?int $mes = null;

    public ?string $semana = null;

    public ?string $ranking_criterio = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $data['ano'] = self::inteiroOuNulo($data['ano'] ?? null);
        $data['mes'] = self::inteiroOuNulo($data['mes'] ?? null);
        $data['semana'] = self::textoOuNulo($data['semana'] ?? null);
        $data['ranking_criterio'] = self::textoOuNulo($data['ranking_criterio'] ?? null);

        return parent::fromArray($data);
    }

    private static function inteiroOuNulo(mixed $valor): ?int
    {
        if (is_int($valor)) {
            return $valor;
        }

        if (is_string($valor) && preg_match('/^\d+$/', trim($valor)) === 1) {
            return (int) trim($valor);
        }

        return null;
    }

    private static function textoOuNulo(mixed $valor): ?string
    {
        if (! is_string($valor)) {
            return null;
        }

        $texto = trim($valor);

        return $texto !== '' ? $texto : null;
    }
}

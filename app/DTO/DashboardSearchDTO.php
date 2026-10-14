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

    public ?string $data_inicio = null;

    public ?string $data_fim = null;

    public ?string $grupo_data_inicio = null;

    public ?string $grupo_data_fim = null;

    public ?string $mes_receitas = null;

    public ?string $semana_receitas = null;

    public ?string $ranking_criterio = null;

    public ?string $ranking_data_inicio = null;

    public ?string $ranking_data_fim = null;

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        $data['data_inicio'] = self::textoOuNulo($data['data_inicio'] ?? null);
        $data['data_fim'] = self::textoOuNulo($data['data_fim'] ?? null);
        $data['grupo_data_inicio'] = self::textoOuNulo($data['grupo_data_inicio'] ?? null);
        $data['grupo_data_fim'] = self::textoOuNulo($data['grupo_data_fim'] ?? null);
        $data['mes_receitas'] = self::textoOuNulo($data['mes_receitas'] ?? null);
        $data['semana_receitas'] = self::textoOuNulo($data['semana_receitas'] ?? null);
        $data['ranking_criterio'] = self::textoOuNulo($data['ranking_criterio'] ?? null);
        $data['ranking_data_inicio'] = self::textoOuNulo($data['ranking_data_inicio'] ?? null);
        $data['ranking_data_fim'] = self::textoOuNulo($data['ranking_data_fim'] ?? null);

        return parent::fromArray($data);
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

<?php

namespace App\DTO;

class MenuBoardDTO extends Dto
{
    public string $nome;

    public string $tema;

    public ?int $usuario_id = null;

    /**
     * Produtos exibidos na TV, na ordem em que aparecem.
     *
     * @var list<array{produto_id: int, destaque: bool}>
     */
    public array $itens = [];

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        if (array_key_exists('usuario_id', $data) && $data['usuario_id'] !== null && $data['usuario_id'] !== '') {
            $data['usuario_id'] = (int) $data['usuario_id'];
        }

        $data['itens'] = array_values(array_map(
            fn (array $item): array => [
                'produto_id' => (int) $item['produto_id'],
                'destaque' => filter_var($item['destaque'] ?? false, FILTER_VALIDATE_BOOLEAN),
            ],
            $data['itens'] ?? []
        ));

        return parent::fromArray($data);
    }

    /**
     * Colunas persistidas na tabela menu_board.
     *
     * @return array{nome: string, tema: string, usuario_id?: int}
     */
    public function dadosDoBoard(): array
    {
        return array_filter([
            'nome' => $this->nome,
            'tema' => $this->tema,
            'usuario_id' => $this->usuario_id,
        ], fn ($valor) => $valor !== null);
    }
}

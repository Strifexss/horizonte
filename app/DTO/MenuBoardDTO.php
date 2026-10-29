<?php

namespace App\DTO;

use App\Models\MenuBoardPagina;
use Illuminate\Http\UploadedFile;

class MenuBoardDTO extends Dto
{
    public string $nome;

    public string $tema;

    public ?int $usuario_id = null;

    /**
     * Páginas na ordem em que a TV as mostra.
     *
     * @var list<array{
     *     nome: string,
     *     layout: string,
     *     duracao_segundos: int,
     *     configuracao: array<string, mixed>,
     *     imagem: ?UploadedFile,
     *     imagem_atual: ?string,
     *     itens: list<array{produto_id: int, destaque: bool}>
     * }>
     */
    public array $paginas = [];

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        if (array_key_exists('usuario_id', $data) && $data['usuario_id'] !== null && $data['usuario_id'] !== '') {
            $data['usuario_id'] = (int) $data['usuario_id'];
        }

        $data['paginas'] = array_values(array_map(
            fn (array $pagina): array => self::normalizarPagina($pagina),
            $data['paginas'] ?? []
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

    /**
     * @param  array<string, mixed>  $pagina
     * @return array{nome: string, layout: string, duracao_segundos: int, configuracao: array<string, mixed>, imagem: ?UploadedFile, imagem_atual: ?string, itens: list<array{produto_id: int, destaque: bool}>}
     */
    private static function normalizarPagina(array $pagina): array
    {
        $layout = (string) $pagina['layout'];
        $configuracao = self::normalizarConfiguracao($layout, $pagina['configuracao'] ?? []);

        return [
            'nome' => trim((string) $pagina['nome']),
            'layout' => $layout,
            'duracao_segundos' => (int) $pagina['duracao_segundos'],
            'configuracao' => $configuracao,
            'imagem' => ($pagina['imagem'] ?? null) instanceof UploadedFile ? $pagina['imagem'] : null,
            'imagem_atual' => in_array($layout, MenuBoardPagina::LAYOUTS_COM_IMAGEM, true) && filled($pagina['imagem_atual'] ?? null)
                ? (string) $pagina['imagem_atual']
                : null,
            'itens' => self::normalizarItens($layout, $configuracao, $pagina['itens'] ?? []),
        ];
    }

    /**
     * Mantém só os campos que o layout usa, já com o tipo certo.
     *
     * @param  array<string, mixed>  $configuracao
     * @return array<string, mixed>
     */
    private static function normalizarConfiguracao(string $layout, array $configuracao): array
    {
        $normalizada = [];

        foreach (MenuBoardPagina::CAMPOS_CONFIGURACAO[$layout] ?? [] as $campo) {
            $valor = $configuracao[$campo] ?? null;

            $normalizada[$campo] = match ($campo) {
                'ocultar_destaques', 'qr_ativo', 'mostrar_descricao' => filter_var($valor ?? false, FILTER_VALIDATE_BOOLEAN),
                'grupo_id' => filled($valor) ? (int) $valor : null,
                'fonte' => $valor === MenuBoardPagina::FONTE_CATEGORIA ? MenuBoardPagina::FONTE_CATEGORIA : MenuBoardPagina::FONTE_MANUAL,
                'ordenacao' => in_array($valor, MenuBoardPagina::ORDENACOES, true) ? $valor : 'nome',
                'foto_posicao' => $valor === 'esquerda' ? 'esquerda' : 'direita',
                default => filled($valor) ? trim((string) $valor) : null,
            };
        }

        return $normalizada;
    }

    /**
     * Itens que o layout realmente usa, sem produto repetido na mesma página.
     *
     * @param  array<string, mixed>  $configuracao
     * @param  array<int, array<string, mixed>>  $itens
     * @return list<array{produto_id: int, destaque: bool}>
     */
    private static function normalizarItens(string $layout, array $configuracao, array $itens): array
    {
        $porCategoria = ($configuracao['fonte'] ?? null) === MenuBoardPagina::FONTE_CATEGORIA;
        $normalizados = [];

        foreach ($itens as $item) {
            $produtoId = (int) $item['produto_id'];
            $destaque = filter_var($item['destaque'] ?? false, FILTER_VALIDATE_BOOLEAN);

            $usado = match ($layout) {
                MenuBoardPagina::LAYOUT_DESTAQUES_GRADE => $destaque || ! $porCategoria,
                MenuBoardPagina::LAYOUT_IMAGEM_LISTA => ! $porCategoria,
                MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE => $normalizados === [],
                default => false,
            };

            if ($usado && ! array_key_exists($produtoId, $normalizados)) {
                $normalizados[$produtoId] = [
                    'produto_id' => $produtoId,
                    'destaque' => $layout === MenuBoardPagina::LAYOUT_DESTAQUES_GRADE && $destaque,
                ];
            }
        }

        return array_values($normalizados);
    }
}

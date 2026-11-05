<?php

namespace App\Repositories;

use App\Ai\Copiloto\TelaAjuda;
use App\Repositories\Interfaces\AjudaRepositoryInterface;
use Illuminate\Support\Facades\File;

/**
 * Lê resources/ajuda/*.md. O cabeçalho entre "---" aceita "chave: valor" e listas "  - item";
 * um item de lista com prefixo "[modulo]" só vale para quem tem o módulo. Uma seção "##" precedida de
 * "<!-- modulo: x -->" só vale para quem tem o módulo x.
 */
class AjudaRepository implements AjudaRepositoryInterface
{
    private const SEPARADOR = "\n\n---\n\n";

    public function __construct(
        private ?string $pasta = null
    ) {
        $this->pasta ??= resource_path('ajuda');
    }

    public function paraPergunta(string $pergunta, array $modulos): string
    {
        $textos = [];

        foreach (TelaAjuda::cases() as $tela) {
            $documento = $this->ler($this->pasta.'/'.$tela->value.'.md');

            if ($documento === null || ! $this->moduloDisponivel($documento['cabecalho']['modulo'] ?? null, $modulos)) {
                continue;
            }

            $textos[] = $this->semSecoesDeModulosAusentes($documento['corpo'], $modulos);
        }

        return implode(self::SEPARADOR, $textos);
    }

    public function sugestoes(?TelaAjuda $tela, array $modulos): array
    {
        $documento = $this->ler($this->pasta.'/'.($tela ?? TelaAjuda::Inicio)->value.'.md');

        if ($documento === null || ! $this->moduloDisponivel($documento['cabecalho']['modulo'] ?? null, $modulos)) {
            $documento = $this->ler($this->pasta.'/'.TelaAjuda::Inicio->value.'.md');
        }

        $itens = $documento['cabecalho']['sugestoes'] ?? [];
        $sugestoes = [];

        foreach (is_array($itens) ? $itens : [] as $item) {
            if (preg_match('/^\[([a-z_]+)\]\s*(.+)$/', $item, $partes) === 1) {
                if (in_array($partes[1], $modulos, true)) {
                    $sugestoes[] = $partes[2];
                }

                continue;
            }

            $sugestoes[] = $item;
        }

        return $sugestoes;
    }

    public function ofertas(array $modulos): array
    {
        $ofertas = [];

        foreach ($modulos as $modulo) {
            $documento = $this->ler($this->pasta.'/modulos/'.$modulo.'.md');

            if ($documento === null || ! is_string($documento['cabecalho']['oferta'] ?? null)) {
                continue;
            }

            $ofertas[] = [
                'modulo' => $modulo,
                'titulo' => (string) ($documento['cabecalho']['titulo'] ?? $modulo),
                'oferta' => $documento['cabecalho']['oferta'],
                'texto' => trim($documento['corpo']),
            ];
        }

        return $ofertas;
    }

    /**
     * @return array{cabecalho: array<string, string|list<string>|null>, corpo: string}|null
     */
    private function ler(string $caminho): ?array
    {
        if (! File::exists($caminho)) {
            return null;
        }

        $conteudo = str_replace("\r\n", "\n", File::get($caminho));

        if (! str_starts_with($conteudo, "---\n")) {
            return ['cabecalho' => [], 'corpo' => $conteudo];
        }

        $fim = strpos($conteudo, "\n---\n", 4);

        if ($fim === false) {
            return ['cabecalho' => [], 'corpo' => $conteudo];
        }

        return [
            'cabecalho' => $this->cabecalho(substr($conteudo, 4, $fim - 4)),
            'corpo' => ltrim(substr($conteudo, $fim + 5)),
        ];
    }

    /**
     * @return array<string, string|list<string>|null>
     */
    private function cabecalho(string $texto): array
    {
        $cabecalho = [];
        $listaAtual = null;

        foreach (explode("\n", $texto) as $linha) {
            if ($listaAtual !== null && preg_match('/^\s+-\s+(.+)$/', $linha, $item) === 1) {
                $cabecalho[$listaAtual][] = trim($item[1]);

                continue;
            }

            if (preg_match('/^([a-z_]+):\s*(.*)$/', $linha, $par) !== 1) {
                continue;
            }

            $valor = trim($par[2]);

            if ($valor === '') {
                $listaAtual = $par[1];
                $cabecalho[$listaAtual] = [];

                continue;
            }

            $listaAtual = null;
            $cabecalho[$par[1]] = $valor === 'null' ? null : $valor;
        }

        return $cabecalho;
    }

    /**
     * @param  list<string>  $modulos
     */
    private function moduloDisponivel(mixed $modulo, array $modulos): bool
    {
        return ! is_string($modulo) || in_array($modulo, $modulos, true);
    }

    /**
     * Remove cada seção "##" marcada com <!-- modulo: x --> quando a Empresa não tem o módulo x.
     *
     * @param  list<string>  $modulos
     */
    private function semSecoesDeModulosAusentes(string $corpo, array $modulos): string
    {
        $resultado = preg_replace_callback(
            '/<!--\s*modulo:\s*([a-z_]+)\s*-->\s*\n(## .*?)(?=\n## |\n<!--\s*modulo:|\z)/s',
            fn (array $secao): string => in_array($secao[1], $modulos, true) ? $secao[2] : '',
            $corpo
        );

        return trim((string) preg_replace("/\n{3,}/", "\n\n", (string) $resultado));
    }
}

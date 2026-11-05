<?php

namespace App\Repositories\Interfaces;

use App\Ai\Copiloto\TelaAjuda;

/**
 * Fonte da ajuda de uso do Copiloto (resources/ajuda/). Hoje lê arquivos; quando a ajuda crescer,
 * a implementação vira busca por seção sem mudar quem a usa.
 */
interface AjudaRepositoryInterface
{
    /**
     * Ajuda que o modelo recebe para responder à pergunta, já sem o que pertence a módulos que a Empresa não tem.
     *
     * @param  list<string>  $modulos  módulos opcionais disponíveis para a Empresa
     */
    public function paraPergunta(string $pergunta, array $modulos): string;

    /**
     * Perguntas sugeridas da tela (as do Início quando a tela não tem ajuda).
     *
     * @param  list<string>  $modulos
     * @return list<string>
     */
    public function sugestoes(?TelaAjuda $tela, array $modulos): array;

    /**
     * Textos de venda dos módulos informados (resources/ajuda/modulos/<modulo>.md).
     *
     * @param  list<string>  $modulos  módulos que a Empresa ainda não tem
     * @return list<array{modulo: string, titulo: string, oferta: string, texto: string}>
     */
    public function ofertas(array $modulos): array;
}

<?php

namespace App\DTO;

/**
 * O que o agente do Copiloto recebe além da pergunta. Montado pelo CopilotoService.
 */
class CopilotoContextoDTO
{
    /**
     * @param  list<string>  $ofertas  textos de venda dos módulos que a Empresa não tem
     * @param  list<object>  $tools  ponto de extensão do Copiloto Pro; hoje sempre vazio
     */
    public function __construct(
        public string $ajuda,
        public array $ofertas = [],
        public ?string $telaAtual = null,
        public array $tools = [],
    ) {}
}

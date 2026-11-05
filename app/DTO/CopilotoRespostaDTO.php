<?php

namespace App\DTO;

class CopilotoRespostaDTO
{
    /**
     * @param  bool  $respondeu  false quando a ajuda não cobria a pergunta
     */
    public function __construct(
        public string $conversaId,
        public string $resposta,
        public bool $respondeu,
    ) {}
}

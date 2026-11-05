<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Copiloto (chat de ajuda)
    |--------------------------------------------------------------------------
    |
    | agente: "laravel_ai" chama a IA (provedor e modelo de config/ai.php);
    | "fake" responde sem IA, para desenvolvimento local e prints.
    |
    | perguntas_por_minuto / perguntas_por_dia: limite por usuário.
    | O limite global da chave de IA é o mesmo dos insights
    | (insights.requisicoes_por_minuto).
    |
    | mensagens_no_contexto: mensagens anteriores enviadas ao modelo.
    | dias_para_apagar_conversa: conversas paradas há mais tempo são apagadas.
    | limite_tokens_ajuda: acima disso, a ajuda completa deixa de servir e é
    | hora de trocar por busca por seção (um teste falha).
    |
    */

    'agente' => env('COPILOTO_AGENTE', 'laravel_ai'),

    'perguntas_por_minuto' => (int) env('COPILOTO_PERGUNTAS_POR_MINUTO', 10),

    'perguntas_por_dia' => (int) env('COPILOTO_PERGUNTAS_POR_DIA', 100),

    'mensagens_no_contexto' => (int) env('COPILOTO_MENSAGENS_NO_CONTEXTO', 20),

    'dias_para_apagar_conversa' => (int) env('COPILOTO_DIAS_PARA_APAGAR_CONVERSA', 30),

    'limite_tokens_ajuda' => (int) env('COPILOTO_LIMITE_TOKENS_AJUDA', 30000),

    'max_tokens_resposta' => (int) env('COPILOTO_MAX_TOKENS_RESPOSTA', 800),

    'timeout_ia_segundos' => (int) env('COPILOTO_TIMEOUT_IA_SEGUNDOS', 60),

];

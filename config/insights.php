<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Análise com IA do Dashboard
    |--------------------------------------------------------------------------
    |
    | limite_diario: análises novas por usuário por dia (respostas em cache
    | não contam).
    |
    | requisicoes_por_minuto: chamadas à IA por minuto somando todos os
    | usuários. O plano gratuito do Gemini aceita 15 por minuto por chave.
    | O limitador usa o cache, então em produção o CACHE_STORE precisa ser
    | compartilhado entre os workers (database ou redis).
    |
    | pausa_apos_sobrecarga_segundos: espera antes de tentar de novo quando o
    | provedor responde 429 ou 503.
    |
    | minutos_na_fila: tempo máximo tentando antes de marcar a análise como falha.
    |
    */

    'limite_diario' => (int) env('INSIGHTS_LIMITE_DIARIO', 5),

    'requisicoes_por_minuto' => (int) env('INSIGHTS_REQUISICOES_POR_MINUTO', 15),

    'pausa_apos_sobrecarga_segundos' => (int) env('INSIGHTS_PAUSA_SOBRECARGA', 30),

    'minutos_na_fila' => (int) env('INSIGHTS_MINUTOS_NA_FILA', 8),

    'gemini_nivel_de_raciocinio' => env('INSIGHTS_GEMINI_RACIOCINIO'),

];

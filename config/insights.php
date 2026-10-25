<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Análise com IA do Dashboard
    |--------------------------------------------------------------------------
    |
    | limite_analises / janela_limite_minutos: análises novas por usuário a
    | cada janela de minutos, contada para trás a partir de agora (respostas
    | em cache não contam).
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

    'limite_analises' => (int) env('INSIGHTS_LIMITE_ANALISES', 5),

    'janela_limite_minutos' => (int) env('INSIGHTS_JANELA_LIMITE_MINUTOS', 10),

    'requisicoes_por_minuto' => (int) env('INSIGHTS_REQUISICOES_POR_MINUTO', 15),

    'pausa_apos_sobrecarga_segundos' => (int) env('INSIGHTS_PAUSA_SOBRECARGA', 30),

    'minutos_na_fila' => (int) env('INSIGHTS_MINUTOS_NA_FILA', 8),

    'gemini_nivel_de_raciocinio' => env('INSIGHTS_GEMINI_RACIOCINIO'),

];

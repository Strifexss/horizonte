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
    | provedor responde 503 ou a conexão falha. O 429 (cota esgotada) não é
    | tentado de novo: a análise vira falha na hora.
    |
    | minutos_na_fila: tempo máximo tentando antes de marcar a análise como falha.
    |
    | timeout_ia_segundos: espera pela resposta da IA em cada chamada. Precisa
    | ficar abaixo do timeout do job GerarAnaliseDashboard (180 s).
    |
    */

    'limite_analises' => (int) env('INSIGHTS_LIMITE_ANALISES', 5),

    'janela_limite_minutos' => (int) env('INSIGHTS_JANELA_LIMITE_MINUTOS', 10),

    'requisicoes_por_minuto' => (int) env('INSIGHTS_REQUISICOES_POR_MINUTO', 15),

    'pausa_apos_sobrecarga_segundos' => (int) env('INSIGHTS_PAUSA_SOBRECARGA', 30),

    'minutos_na_fila' => (int) env('INSIGHTS_MINUTOS_NA_FILA', 8),

    'timeout_ia_segundos' => (int) env('INSIGHTS_TIMEOUT_IA', 150),

    'gemini_nivel_de_raciocinio' => env('INSIGHTS_GEMINI_RACIOCINIO'),

];

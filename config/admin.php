<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Painel Administrativo
    |--------------------------------------------------------------------------
    |
    | "path" é o caminho secreto do painel. Vazio = rotas não registradas.
    | "emails" é a lista (separada por vírgula) dos e-mails de Administrador.
    |
    */

    'path' => env('ADMIN_PATH'),

    'emails' => array_values(array_filter(array_map(
        fn (string $email): string => mb_strtolower(trim($email)),
        explode(',', (string) env('ADMIN_EMAILS', ''))
    ))),

    /*
    | Transferência (duplicação) de dados entre usuários, executada de forma síncrona.
    | "max" é o total de registros aceito por operação; "chunk" o tamanho de cada lote.
    */

    'transferencia' => [
        'max' => (int) env('TRANSFER_MAX', 1000),
        'chunk' => (int) env('TRANSFER_CHUNK', 100),
    ],

];

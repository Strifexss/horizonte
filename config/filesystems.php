<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Novidades Images Disk
    |--------------------------------------------------------------------------
    |
    | Disk that stores the images of the Novidades. It must serve public URLs.
    | On Laravel Cloud the local disk is wiped on every deploy and is not shared
    | between replicas, so production points this to the attached bucket.
    |
    */

    'novidades_disk' => env('NOVIDADES_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Produtos Images Disk
    |--------------------------------------------------------------------------
    |
    | Disk that stores the product photos shown on the Menu Board. Like the
    | Novidades disk, it must serve public URLs and point to the bucket in
    | production.
    |
    */

    'produtos_disk' => env('PRODUTOS_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Menu Boards Images Disk
    |--------------------------------------------------------------------------
    |
    | Disk that stores the images of the Menu Board pages (banners and the
    | image of the "Imagem + Lista" layout). Same requirements as the disks
    | above: public URLs, bucket in production.
    |
    */

    'menu_boards_disk' => env('MENU_BOARDS_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',
            'throw' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];

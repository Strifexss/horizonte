<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PINs vivem 10 minutos; os existentes são descartados para o índice único entrar sem conflito.
     */
    public function up(): void
    {
        DB::table('tv_pareamento_pin')->delete();

        Schema::table('tv_pareamento_pin', function (Blueprint $table) {
            $table->unique('pin');
        });
    }

    public function down(): void
    {
        Schema::table('tv_pareamento_pin', function (Blueprint $table) {
            $table->dropUnique(['pin']);
        });
    }
};

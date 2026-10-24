<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('novidade_imagem', function (Blueprint $table) {
            $table->id();
            $table->foreignId('novidade_id')->constrained('novidade')->cascadeOnDelete();
            $table->string('caminho')->unique();
            $table->unsignedSmallInteger('ordem')->default(0);
            $table->timestamps();

            $table->index(['novidade_id', 'ordem']);
        });

        DB::table('novidade')->whereNotNull('imagem_path')->orderBy('id')->each(function (object $novidade) {
            DB::table('novidade_imagem')->insert([
                'novidade_id' => $novidade->id,
                'caminho' => $novidade->imagem_path,
                'ordem' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        Schema::table('novidade', function (Blueprint $table) {
            $table->dropColumn('imagem_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('novidade', function (Blueprint $table) {
            $table->string('imagem_path')->nullable();
        });

        DB::table('novidade_imagem')->where('ordem', 0)->orderBy('id')->each(function (object $imagem) {
            DB::table('novidade')->where('id', $imagem->novidade_id)->update(['imagem_path' => $imagem->caminho]);
        });

        Schema::dropIfExists('novidade_imagem');
    }
};

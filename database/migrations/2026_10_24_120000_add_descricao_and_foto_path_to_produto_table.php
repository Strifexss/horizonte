<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            $table->string('descricao', 160)->nullable();
            $table->string('foto_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            $table->dropColumn(['descricao', 'foto_path']);
        });
    }
};

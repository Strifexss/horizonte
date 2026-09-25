<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conta', function (Blueprint $table) {
            $table->unsignedTinyInteger('padrao')->default(0)->after('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::table('conta', function (Blueprint $table) {
            $table->dropColumn('padrao');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Contas com senha e contas Google são independentes: o e-mail deixa de ser único
     * na tabela e passa a ser único por método de login (validado na aplicação).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('password')->nullable()->change();
            $table->dropUnique(['email']);
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->unique('email');
            $table->string('password')->nullable(false)->change();
            $table->dropUnique(['google_id']);
            $table->dropColumn('google_id');
        });
    }
};

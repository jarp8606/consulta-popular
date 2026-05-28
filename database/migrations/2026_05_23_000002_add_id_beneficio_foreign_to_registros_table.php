<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('registros', function (Blueprint $table) {
            //
          $table->foreignId('id_beneficio')
          ->nullable() // <--- ESTO ES LO QUE SALVA TU DATA
          ->after('id')
          ->constrained('beneficios')
          ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.2.0
     */
    public function down(): void
    {
        Schema::table('registros', function (Blueprint $table) {
            //
        });
    }
};

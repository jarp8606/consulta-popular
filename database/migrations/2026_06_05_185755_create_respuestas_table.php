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
Schema::create('respuestas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('registro_id')->constrained('registros')->onDelete('cascade');
    $table->foreignId('pregunta_id')->constrained();
    $table->foreignId('catalogo_id')->nullable()->constrained();
    $table->string('valor_extra')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('respuestas');
    }
};

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
        Schema::create('beneficios', function (Blueprint $table) {
            $table->id(); // Este es el ID que se relaciona con id_beneficio en registros
            $table->string('nombre')->unique(); // Ejemplo: "APOYO ALIMENTARIO", "BECA ESCOLAR"
            $table->text('descripcion')->nullable(); 
            $table->boolean('activo')->default(true); // Para poder desactivar beneficios sin borrarlos
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficios');
    }
};

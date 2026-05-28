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
Schema::create('beneficio_registro', function (Blueprint $table) {
            $table->id();
            
            // Relación con la tabla registros
            $table->foreignId('registro_id')
                  ->constrained('registros')
                  ->onDelete('cascade'); // Si se borra el ciudadano, se limpia su historial de beneficios

            // Relación con la tabla beneficios
            $table->foreignId('beneficio_id')
                  ->constrained('beneficios')
                  ->onDelete('cascade'); // Si se borra el beneficio, se remueve de los ciudadanos

            $table->timestamps();

            // Evita que un usuario se inscriba exactamente al mismo beneficio más de una vez
            $table->unique(['registro_id', 'beneficio_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficio_registro');
    }
};

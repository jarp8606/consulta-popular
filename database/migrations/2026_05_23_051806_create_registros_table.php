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
        Schema::create('registros', function (Blueprint $table) {
        $table->id();
        $table->string('nombre');
        $table->string('snombre')->nullable();
        $table->string('apellido');
        $table->string('sapellido')->nullable();
        $table->string('colonia');
        $table->string('calle');
        $table->string('municipio');
        $table->integer('cp')->nullable();
        $table->string('genero');
        $table->integer('edad')->nullable();
        $table->date('nacimiento')->nullable();
        $table->integer('numext');
        $table->integer('numint')->nullable();
        $table->string('telefono', 15);
        $table->timestamps();
        // $table->foreignId('id_beneficio')
        //           ->nullable()
        //           ->after('id')
        //           ->constrained('beneficios') // Se relaciona automáticamente con el 'id' de la tabla 'beneficios'
        //           ->onDelete('set null');     // Si se borra el beneficio, el registro queda en NULL de forma segura
        // 
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       Schema::table('registros', function (Blueprint $table) {
            // 1. Primero eliminamos la restricción de la llave foránea
            $table->dropForeign(['id_beneficio']);
            
            // 2. Luego eliminamos la columna por completo
            $table->dropColumn('id_beneficio');
        });
    }
};

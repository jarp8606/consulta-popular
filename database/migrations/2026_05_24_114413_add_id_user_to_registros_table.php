<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('registros', function (Blueprint $table) {
        // Agregamos id_user para saber quién hizo la captura
        $table->unsignedBigInteger('id_user')->nullable();
        
        // Si quieres que sea llave foránea hacia la tabla users:
        $table->foreign('id_user')->references('id')->on('users')->onDelete('set null');
    });
}

public function down()
{
    Schema::table('registros', function (Blueprint $table) {
        $table->dropForeign(['id_user']);
        $table->dropColumn('id_user');
    });
}
};

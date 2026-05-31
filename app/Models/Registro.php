<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registro extends Model
{
    //
    use HasFactory;

    // Le indicamos explícitamente la tabla si es necesario
    protected $table = 'registros';

    /**
     * 🛡️ Campos permitidos para asignación masiva (Mass Assignment)
     */
    protected $fillable = [
        'nombre',
        'snombre',
        'apellido',
        'sapellido',
        'colonia',
        'calle',
        'municipio',
        'cp',
        'genero',
        'edad',
        'nacimiento',
        'numext',
        'numint',
        'telefono',
        'papa',
        // 'id_beneficio',
        'id_user',
    ];

    public function beneficios(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
{
    return $this->belongsToMany(Beneficio::class, 'beneficio_registro', 'registro_id', 'beneficio_id')
                ->withTimestamps();
}
}

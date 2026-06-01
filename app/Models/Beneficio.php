<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Beneficio extends Model
{
    //protected $table = 'beneficios';

    protected $fillable = [
        'nombre',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean', 
    ];

    /**
     * Obtener todos los ciudadanos asociados a este beneficio (Muchos a Muchos).
     */
    public function registros(): BelongsToMany
    {
        return $this->belongsToMany(
            Registro::class, 
            'beneficio_registro', 
            'beneficio_id', 
            'registro_id'
        )->withTimestamps();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalogo extends Model
{
    use HasFactory;

    protected $table = 'catalogos';

    protected $fillable = [
        'pregunta_id',
        'nombre',
    ];

    /**
     * Relación con la pregunta
     */
    public function pregunta()
    {
        return $this->belongsTo(Pregunta::class, 'pregunta_id');
    }

    /**
     * Relación inversa con respuestas
     */
    public function respuestas()
    {
        return $this->hasMany(Respuesta::class, 'catalogo_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pregunta extends Model
{
    use HasFactory;

    protected $table = 'preguntas';

    protected $fillable = [
        'descripcion',
        'activa',
    ];

    /**
     * Relación con respuestas
     */
    public function respuestas()
    {
        return $this->hasMany(Respuesta::class, 'pregunta_id');
    }

    /**
     * Relación con catálogos
     */
    public function catalogos()
    {
        return $this->hasMany(Catalogo::class, 'pregunta_id');
    }
}
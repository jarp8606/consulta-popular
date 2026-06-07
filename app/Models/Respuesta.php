<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Respuesta extends Model
{
    use HasFactory;

    protected $table = 'respuestas';

    protected $fillable = [
        'registro_id',
        'pregunta_id',
        'catalogo_id',
        'valor_extra',
    ];

    /**
     * Relación con el beneficiario/registro
     */
    public function registro()
    {
        return $this->belongsTo(Registro::class, 'registro_id');
    }

    /**
     * Relación con la pregunta
     */
    public function pregunta()
    {
        return $this->belongsTo(Pregunta::class, 'pregunta_id');
    }

    /**
     * Relación con el catálogo (para respuestas SI)
     */
    public function catalogo()
    {
        return $this->belongsTo(Catalogo::class, 'catalogo_id');
    }
}
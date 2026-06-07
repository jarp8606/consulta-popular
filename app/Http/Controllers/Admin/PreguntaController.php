<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pregunta;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class PreguntaController extends Controller
{
    /**
     * Reglas de validación
     */
    private function getReglasValidacion($id = null)
    {
        return [
            'descripcion' => [
                'required',
                'string',
                'max:500',
                'min:5',
                // Regex más permisiva y segura
                'regex:/^[\p{L}\p{N}\s\?¿¡!.,;:()-]+$/u',
            ],
            'activa' => 'boolean',
        ];
    }

    /**
     * Mensajes personalizados
     */
    private function getMensajesPersonalizados()
    {
        return [
            'descripcion.required' => 'La pregunta es obligatoria.',
            'descripcion.string' => 'La pregunta debe ser texto válido.',
            'descripcion.max' => 'La pregunta no puede exceder los 500 caracteres.',
            'descripcion.min' => 'La pregunta debe tener al menos 5 caracteres.',
            'descripcion.regex' => 'La pregunta contiene caracteres no permitidos. Use solo letras, números, espacios y signos de puntuación básicos.',
            'activa.boolean' => 'El estado debe ser activo o inactivo.',
        ];
    }

    /**
     * Formatear pregunta a mayúsculas con signos de interrogación
     */
    private function formatearPregunta($descripcion)
    {
        // Limpiar espacios múltiples y trim
        $descripcion = preg_replace('/\s+/', ' ', trim($descripcion));
        
        // Convertir a mayúsculas
        $descripcion = mb_strtoupper($descripcion, 'UTF-8');
        
        // Eliminar signos de interrogación existentes para evitar duplicados
        $descripcion = str_replace(['?', '¿'], '', $descripcion);
        
        // Agregar signos de interrogación correctamente
        $descripcion = '¿' . trim($descripcion) . '?';
        
        return $descripcion;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $preguntas = Pregunta::orderBy('id', 'asc')->get();

            return Inertia::render('preguntas/index', [
                'preguntas' => $preguntas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar preguntas: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al cargar las preguntas']);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('preguntas/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación
        $validated = $request->validate(
            $this->getReglasValidacion(),
            $this->getMensajesPersonalizados()
        );

        DB::beginTransaction();
        
        try {
            // Formatear la pregunta
            $descripcionFormateada = $this->formatearPregunta($validated['descripcion']);
            
            // Verificar si ya existe una pregunta similar (opcional)
            $existente = Pregunta::where('descripcion', $descripcionFormateada)->first();
            if ($existente) {
                DB::rollBack();
                return back()->withErrors([
                    'descripcion' => 'Ya existe una pregunta con este texto.'
                ])->withInput();
            }
            
            $pregunta = Pregunta::create([
                'descripcion' => $descripcionFormateada,
                'activa' => $validated['activa'] ?? true,
            ]);

            DB::commit();

            Log::info('Pregunta creada exitosamente', [
                'id' => $pregunta->id,
                'usuario' => auth()->id(),
                'ip' => $request->ip()
            ]);

            return redirect()->route('preguntas.index')
                ->with('success', 'Pregunta creada exitosamente.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear pregunta', [
                'error' => $e->getMessage(),
                'data' => $validated,
                'usuario' => auth()->id()
            ]);
            
            return back()->withErrors(['error' => 'Error al crear la pregunta: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        try {
            $pregunta = Pregunta::findOrFail($id);
            return Inertia::render('preguntas/edit', [
                'pregunta' => $pregunta
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cargar pregunta para editar', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return redirect()->route('preguntas.index')
                ->withErrors(['error' => 'La pregunta no existe']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Validación
        $validated = $request->validate(
            $this->getReglasValidacion($id),
            $this->getMensajesPersonalizados()
        );

        DB::beginTransaction();
        
        try {
            $pregunta = Pregunta::findOrFail($id);
            
            // Formatear la pregunta
            $descripcionFormateada = $this->formatearPregunta($validated['descripcion']);
            
            // Verificar si ya existe otra pregunta con el mismo texto
            $existente = Pregunta::where('descripcion', $descripcionFormateada)
                ->where('id', '!=', $id)
                ->first();
                
            if ($existente) {
                DB::rollBack();
                return back()->withErrors([
                    'descripcion' => 'Ya existe otra pregunta con este texto.'
                ])->withInput();
            }
            
            $pregunta->update([
                'descripcion' => $descripcionFormateada,
                'activa' => $validated['activa'],
            ]);

            DB::commit();

            Log::info('Pregunta actualizada exitosamente', [
                'id' => $pregunta->id,
                'usuario' => auth()->id(),
                'ip' => $request->ip()
            ]);

            return redirect()->route('preguntas.index')
                ->with('success', 'Pregunta actualizada exitosamente.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar pregunta', [
                'id' => $id,
                'error' => $e->getMessage(),
                'data' => $validated,
                'usuario' => auth()->id()
            ]);
            
            return back()->withErrors(['error' => 'Error al actualizar la pregunta: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggle($id)
    {
        DB::beginTransaction();
        
        try {
            $pregunta = Pregunta::findOrFail($id);
            $pregunta->activa = !$pregunta->activa;
            $pregunta->save();

            DB::commit();

            Log::info('Estado de pregunta cambiado', [
                'id' => $pregunta->id,
                'nuevo_estado' => $pregunta->activa ? 'activa' : 'inactiva',
                'usuario' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'activa' => $pregunta->activa,
                'message' => $pregunta->activa ? 'Pregunta activada' : 'Pregunta desactivada'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al cambiar estado de pregunta', [
                'id' => $id,
                'error' => $e->getMessage(),
                'usuario' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        
        try {
            $pregunta = Pregunta::findOrFail($id);

            // Verificar si tiene respuestas asociadas
            $respuestasCount = $pregunta->respuestas()->count();
            if ($respuestasCount > 0) {
                DB::rollBack();
                Log::warning('Intento de eliminar pregunta con respuestas asociadas', [
                    'id' => $id,
                    'respuestas_count' => $respuestasCount,
                    'usuario' => auth()->id()
                ]);
                
                return back()->withErrors([
                    'error' => "No se puede eliminar la pregunta porque tiene {$respuestasCount} respuestas asociadas."
                ]);
            }

            $descripcion = $pregunta->descripcion;
            $pregunta->delete();

            DB::commit();

            Log::info('Pregunta eliminada exitosamente', [
                'id' => $id,
                'descripcion' => $descripcion,
                'usuario' => auth()->id()
            ]);

            return redirect()->route('preguntas.index')
                ->with('success', 'Pregunta eliminada exitosamente.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar pregunta', [
                'id' => $id,
                'error' => $e->getMessage(),
                'usuario' => auth()->id()
            ]);
            
            return back()->withErrors(['error' => 'Error al eliminar la pregunta: ' . $e->getMessage()]);
        }
    }
}
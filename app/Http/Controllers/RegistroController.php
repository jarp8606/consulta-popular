<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Registro;
use App\Models\Beneficio;
use App\Models\Pregunta;
use App\Models\Catalogo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class RegistroController extends Controller
{
    /**
     * Reglas de validación compartidas
     */
    private function getReglasValidacion()
    {
        return [
            'nombre'     => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s]+$/u'],
            'snombre'    => ['nullable', 'string', 'max:255', 'regex:/^[\p{L}\s]+$/u'],
            'apellido'   => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s]+$/u'],
            'sapellido'  => ['nullable', 'string', 'max:255', 'regex:/^[\p{L}\s]+$/u'],
            'colonia'    => ['required', 'string', 'exists:colonias,nombre_de_la_colonia'],
            'calle'      => ['required', 'string', 'exists:calles_aguascalientes,nombre'],
            'municipio'  => ['required', 'string', 'exists:colonias,nombre_del_municipio'],
            'cp'         => ['nullable', 'numeric', 'digits:5'],
            'genero'     => ['required', 'string', Rule::in(['M', 'F', 'OTRO'])],
            'edad'       => ['required', 'numeric', 'min:0', 'max:120'],
            'nacimiento' => ['required', 'date', 'before_or_equal:today', 'after_or_equal:1900-01-01'],
            'numext'     => ['required', 'numeric', 'min:1'],
            'numint'     => ['nullable', 'numeric', 'min:1'],
            'telefono'   => ['required', 'digits:10'],
            'respuestas' => ['nullable', 'array'],
            'detalles'   => ['nullable', 'array'],
        ];
    }

    /**
     * Mensajes personalizados
     */
    private function getMensajesPersonalizados()
    {
        return [
            'nombre.regex'               => 'El nombre solo puede contener letras y espacios.',
            'apellido.regex'             => 'El apellido solo puede contener letras y espacios.',
            'snombre.regex'              => 'El segundo nombre solo puede contener letras y espacios.',
            'sapellido.regex'            => 'El segundo apellido solo puede contener letras y espacios.',
            'colonia.exists'             => 'La colonia no existe en nuestros registros.',
            'calle.exists'               => 'La calle seleccionada no existe.',
            'municipio.exists'           => 'El municipio seleccionado no existe.',
            'telefono.digits'            => 'El teléfono debe tener exactamente 10 dígitos.',
            'nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
            'nacimiento.after_or_equal'  => 'La fecha de nacimiento no es válida.',
            'edad.min'                   => 'La edad debe ser un número positivo.',
            'edad.max'                   => 'La edad no puede ser mayor a 120 años.',
            'genero.in'                  => 'El género seleccionado no es válido.',
            'required'                   => 'El campo :attribute es obligatorio.',
            'numeric'                    => 'El campo :attribute debe ser numérico.',
            'digits'                     => 'El campo :attribute debe tener exactamente :digits dígitos.',
            'cp.digits'                  => 'El código postal debe tener 5 dígitos.',
            'numext.min'                 => 'El número exterior debe ser mayor a 0.',
            'numint.min'                 => 'El número interior debe ser mayor a 0.',
        ];
    }

    /**
     * Limpiar tildes de una cadena
     */
    private function limpiarTildes($cadena)
    {
        if (!is_string($cadena)) {
            return $cadena;
        }
        
        $mapeo = [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U',
            'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
            'À' => 'A', 'È' => 'E', 'Ì' => 'I', 'Ò' => 'O', 'Ù' => 'U',
            'ñ' => 'ñ', 'Ñ' => 'Ñ' // Mantener Ñ
        ];
        
        return strtr($cadena, $mapeo);
    }

    /**
     * Limpiar y preparar los datos del request
     */
    private function limpiarYPrepararDatos(Request $request)
    {
        // Limpiar tildes de los campos de texto
        $camposTexto = ['nombre', 'snombre', 'apellido', 'sapellido', 'colonia', 'calle', 'municipio'];

        foreach ($camposTexto as $campo) {
            if ($request->has($campo) && is_string($request->$campo)) {
                $request->merge([$campo => $this->limpiarTildes($request->$campo)]);
            }
        }

        // Asegurar que el género venga en mayúsculas y sea válido
        if ($request->has('genero') && is_string($request->genero)) {
            $genero = mb_strtoupper(trim($request->genero), 'UTF-8');
            $genero = match($genero) {
                'MASCULINO', 'M' => 'M',
                'FEMENINO', 'F' => 'F',
                'OTRO', 'O' => 'OTRO',
                default => $genero
            };
            $request->merge(['genero' => $genero]);
        }

        return $request;
    }

    /**
     * Formatear teléfono
     */
    private function formatearTelefono($telefono)
    {
        if (!$telefono) {
            return null;
        }

        $numeros = preg_replace('/[^0-9]/', '', $telefono);

        if (strlen($numeros) === 10) {
            return preg_replace('/(\d{3})(\d{3})(\d{4})/', '$1 $2 $3', $numeros);
        }

        return $numeros;
    }

    /**
     * Convertir datos a mayúsculas
     */
    private function convertirMayusculas(array $data, array $excluir = ['nacimiento', 'edad', 'telefono'])
    {
        foreach ($data as $key => $value) {
            if (in_array($key, $excluir)) {
                continue;
            }

            if (is_string($value)) {
                $data[$key] = mb_strtoupper(trim($value), 'UTF-8');
            }
        }

        return $data;
    }

    /**
     * Detectar duplicados
     */
    private function detectarDuplicados($datos, $excluirId = null)
    {
        $nombre = mb_strtoupper(trim($datos['nombre']), 'UTF-8');
        $apellido = mb_strtoupper(trim($datos['apellido']), 'UTF-8');
        $nacimiento = $datos['nacimiento'];

        $query = Registro::whereRaw('UPPER(nombre) = ?', [$nombre])
            ->whereRaw('UPPER(apellido) = ?', [$apellido])
            ->where('nacimiento', $nacimiento);

        if ($excluirId) {
            $query->where('id', '!=', $excluirId);
        }

        return $query->get();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Registro::query();

            if ($request->filled('nombre')) {
                $nombre = mb_strtoupper($request->input('nombre'), 'UTF-8');
                $query->where('nombre', 'LIKE', "%{$nombre}%");
            }

            if ($request->filled('apellido')) {
                $apellido = mb_strtoupper($request->input('apellido'), 'UTF-8');
                $query->where('apellido', 'LIKE', "%{$apellido}%");
            }

            if ($request->filled('nacimiento')) {
                $query->where('nacimiento', $request->input('nacimiento'));
            }

            $beneficiarios = $query->orderBy('id', 'desc')->get();
            $preguntas = Pregunta::where('activa', true)->orderBy('id')->get();

            return Inertia::render('consulta', [
                'beneficiarios' => $beneficiarios,
                'preguntas'     => $preguntas,
                'filtros'       => $request->only(['nombre', 'apellido', 'nacimiento'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error en index Registro: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al cargar los datos']);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $preguntas = Pregunta::where('activa', true)->get();
            return Inertia::render('create', ['preguntas' => $preguntas]);
        } catch (\Exception $e) {
            Log::error('Error en create Registro: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error al cargar el formulario']);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fuerzaBruta = $request->boolean('fuerza_bruta');

        // 1. Limpieza y preparación de datos
        $request = $this->limpiarYPrepararDatos($request);
        
        if ($request->has('telefono')) {
            $request->merge(['telefono' => str_replace(' ', '', $request->telefono)]);
        }

        // 2. Validación
        $datosValidados = $request->validate(
            $this->getReglasValidacion(),
            $this->getMensajesPersonalizados()
        );

        // 3. Extracción de arrays
        $respuestas = $datosValidados['respuestas'] ?? [];
        $detalles   = $datosValidados['detalles'] ?? [];

        // 4. Preparación de datos del Registro
        $datosParaCrear = $datosValidados;
        unset($datosParaCrear['respuestas'], $datosParaCrear['detalles']);

        if (isset($datosParaCrear['telefono'])) {
            $datosParaCrear['telefono'] = $this->formatearTelefono($datosParaCrear['telefono']);
        }

        // 5. Verificación de duplicados
        if (!$fuerzaBruta) {
            $duplicados = $this->detectarDuplicados($datosParaCrear);
            if ($duplicados->isNotEmpty()) {
                return back()->with([
                    'advertencia' => 'Ya existen registros similares.',
                    'coincidencias' => $duplicados
                ]);
            }
        }

        $datosFinales = $this->convertirMayusculas($datosParaCrear);
        $datosFinales['id_user'] = Auth::id();
        
        if (is_null($datosFinales['sapellido'] ?? null)) {
            $datosFinales['papa'] = true;
        }

        // 6. Transacción
        DB::beginTransaction();
        
        try {
            $nuevoRegistro = Registro::create($datosFinales);

            if (!empty($respuestas)) {
                foreach ($respuestas as $preguntaId => $valorRespuesta) {
                    $valorNormalizado = mb_strtoupper(trim($valorRespuesta), 'UTF-8');
                    $descripcion = $detalles[$preguntaId] ?? null;
                    $catalogoId = null;

                    // Validar que el detalle no esté vacío cuando es requerido
                    if ($descripcion && trim($descripcion) !== '') {
                        $descripcion = mb_strtoupper(trim($descripcion), 'UTF-8');
                    } else {
                        $descripcion = null;
                    }

                    // LÓGICA DE CATÁLOGO
                    if ($preguntaId == 6) {
                        if ($valorNormalizado === 'NO' && $descripcion) {
                            $catalogo = Catalogo::firstOrCreate([
                                'pregunta_id' => $preguntaId,
                                'nombre'      => $descripcion
                            ]);
                            $catalogoId = $catalogo->id;
                        }
                    } else {
                        if ($valorNormalizado === 'SI' && $descripcion) {
                            $catalogo = Catalogo::firstOrCreate([
                                'pregunta_id' => $preguntaId,
                                'nombre'      => $descripcion
                            ]);
                            $catalogoId = $catalogo->id;
                        }
                    }

                    $nuevoRegistro->respuestas()->create([
                        'pregunta_id' => (int)$preguntaId,
                        'catalogo_id' => $catalogoId,
                        'valor_extra' => $valorNormalizado,
                        'detalle'     => $descripcion,
                    ]);
                }
            }

            DB::commit();

            Log::info('Registro creado exitosamente', [
                'id' => $nuevoRegistro->id,
                'usuario' => Auth::id(),
                'ip' => $request->ip()
            ]);

            return redirect()->route('dashboard')->with('success', 'Registro completado con éxito!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en store Registro', [
                'error' => $e->getMessage(),
                'usuario' => Auth::id(),
                'data' => $datosFinales
            ]);
            
            return back()->withErrors(['error' => 'Error al guardar: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $fuerzaBruta = $request->boolean('fuerza_bruta');

        // 1. Encontrar el registro
        $beneficiario = Registro::findOrFail($id);

        // 2. Limpiar tildes de los datos
        $request = $this->limpiarYPrepararDatos($request);

        if ($request->has('telefono')) {
            $request->merge(['telefono' => str_replace(' ', '', $request->telefono)]);
        }

        // 3. Validar los datos
        $datosValidados = $request->validate(
            $this->getReglasValidacion(),
            $this->getMensajesPersonalizados()
        );

        // 4. Extraer respuestas y detalles
        $respuestas = $datosValidados['respuestas'] ?? [];
        $detalles = $datosValidados['detalles'] ?? [];
        
        unset($datosValidados['respuestas']);
        unset($datosValidados['detalles']);

        // 5. Detector de duplicados
        if (!$fuerzaBruta) {
            $duplicados = $this->detectarDuplicados($datosValidados, $id);
            if ($duplicados->isNotEmpty()) {
                return back()->with([
                    'advertencia' => '¡Atención! Ya existen personas registradas con datos idénticos.',
                    'coincidencias' => $duplicados,
                ]);
            }
        }

        // 6. Formatear teléfono
        if (isset($datosValidados['telefono'])) {
            $datosValidados['telefono'] = $this->formatearTelefono($datosValidados['telefono']);
        }

        // 7. Convertir a mayúsculas
        $datosFinales = $this->convertirMayusculas($datosValidados);
        
        if (is_null($datosFinales['sapellido'] ?? null)) {
            $datosFinales['papa'] = true;
        }
        
        $datosFinales['id_user'] = Auth::id();

        // 8. Actualizar en base de datos
        DB::beginTransaction();

        try {
            $beneficiario->update($datosFinales);

            // Actualizar respuestas
            $beneficiario->respuestas()->delete();
            
            if (!empty($respuestas)) {
                foreach ($respuestas as $preguntaId => $valorRespuesta) {
                    $valorNormalizado = mb_strtoupper(trim($valorRespuesta), 'UTF-8');
                    $detalle = $detalles[$preguntaId] ?? null;
                    $catalogoId = null;

                    if ($detalle && trim($detalle) !== '') {
                        $detalle = mb_strtoupper(trim($detalle), 'UTF-8');
                    } else {
                        $detalle = null;
                    }

                    // Lógica de catálogo
                    if ($preguntaId == 6) {
                        if ($valorNormalizado === 'NO' && $detalle) {
                            $catalogo = Catalogo::firstOrCreate([
                                'pregunta_id' => $preguntaId,
                                'nombre'      => $detalle
                            ]);
                            $catalogoId = $catalogo->id;
                        }
                    } else {
                        if ($valorNormalizado === 'SI' && $detalle) {
                            $catalogo = Catalogo::firstOrCreate([
                                'pregunta_id' => $preguntaId,
                                'nombre'      => $detalle
                            ]);
                            $catalogoId = $catalogo->id;
                        }
                    }

                    $beneficiario->respuestas()->create([
                        'pregunta_id' => (int)$preguntaId,
                        'catalogo_id' => $catalogoId,
                        'valor_extra' => $valorNormalizado,
                        'detalle'     => $detalle,
                    ]);
                }
            }

            DB::commit();

            Log::info('Registro actualizado con éxito', [
                'id' => $id,
                'usuario' => Auth::id(),
                'ip' => $request->ip()
            ]);

            if ($request->wantsJson()) {
                $beneficiarioActualizado = Registro::with(['respuestas.catalogo'])->find($id);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Registro actualizado con éxito.',
                    'data' => [
                        'beneficiario' => $beneficiarioActualizado,
                        'respuestas' => $beneficiarioActualizado->respuestas
                    ]
                ]);
            }

            return redirect()->back()->with('success', 'Registro actualizado de forma correcta.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar registro', [
                'id' => $id,
                'error' => $e->getMessage(),
                'usuario' => Auth::id()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'errors' => ['error' => 'Error al actualizar: ' . $e->getMessage()]
                ], 500);
            }

            return redirect()->back()->withErrors([
                'error' => 'Ocurrió un error interno al procesar la actualización.'
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $beneficiario = Registro::findOrFail($id);

        DB::beginTransaction();

        try {
            // Eliminar respuestas primero
            $beneficiario->respuestas()->delete();
            
            // Eliminar relaciones con beneficios si existen
            $beneficiario->beneficios()->detach();
            
            // Eliminar el registro
            $beneficiario->delete();

            DB::commit();

            Log::info('Registro eliminado con éxito', [
                'id' => $id,
                'usuario' => Auth::id()
            ]);

            return redirect()->back()->with('success', 'El registro ha sido eliminado exitosamente.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar registro', [
                'id' => $id,
                'error' => $e->getMessage(),
                'usuario' => Auth::id()
            ]);

            return redirect()->back()->withErrors([
                'error' => 'No se pudo eliminar el registro: ' . $e->getMessage()
            ]);
        }
    }
}
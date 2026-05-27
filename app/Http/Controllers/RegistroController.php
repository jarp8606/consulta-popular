<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Registro;
use App\Models\Beneficio;
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
    private function getReglasValidacion($id = null)
    {
        $reglas = [
            'nombre'     => ['required', 'string', 'max:255'],
            'snombre'    => ['nullable', 'string', 'max:255'],
            'apellido'   => ['required', 'string', 'max:255'],
            'sapellido'  => ['nullable', 'string', 'max:255'],
            'colonia'    => ['required', 'string', 'exists:colonias,nombre_de_la_colonia'],
            'calle'      => ['required', 'string', 'exists:calles_aguascalientes,nombre'],
            'municipio'  => ['required', 'string', 'exists:colonias,nombre_del_municipio'],
            'cp'         => ['nullable', 'numeric'],
            'genero'     => ['required', 'string'],
            'edad'       => ['required', 'numeric', 'min:0', 'max:120'],
            'nacimiento' => ['required', 'date', 'before_or_equal:today'],
            'numext'     => ['nullable', 'numeric'],
            'numint'     => ['nullable', 'numeric'],
            'telefono'   => ['required', 'digits:10'],
            'beneficios' => ['nullable', 'array'],
            'beneficios.*'=> ['numeric', 'exists:beneficios,id'],
        ];

        // Regla de unicidad: Verificar si ya existe un beneficiario con los mismos datos
        // Solo aplicar si NO es fuerza bruta
        if (!$this->isFuerzaBruta(request())) {
            $reglas['nombre'][] = function ($attribute, $value, $fail) use ($id) {
                $value = mb_strtoupper(trim($value), 'UTF-8');
                $apellido = mb_strtoupper(trim(request()->apellido), 'UTF-8');
                $nacimiento = request()->nacimiento;
                
                $query = Registro::where('nombre', $value)
                    ->where('apellido', $apellido)
                    ->where('nacimiento', $nacimiento);
                
                // Si es actualización, excluir el registro actual
                if ($id) {
                    $query->where('id', '!=', $id);
                }
                
                if ($query->exists()) {
                    $fail('Ya existe un beneficiario registrado con el mismo nombre, apellido y fecha de nacimiento.');
                }
            };
        }

        return $reglas;
    }

    /**
     * Mensajes personalizados
     */
    private function getMensajesPersonalizados()
    {
        return [
            'colonia.exists'             => 'La colonia no existe en nuestros registros, verifique o pongase en contacto con un administrador.',
            'calle.exists'               => 'La calle seleccionada no existe, verifique o pongase en contacto con un administrador.',
            'municipio.exists'           => 'El municipio seleccionado no existe, verifique o pongase en contacto con un administrador.',
            'telefono.digits'            => 'El teléfono debe tener exactamente 10 dígitos.',
            'nacimiento.before_or_equal' => 'La fecha de nacimiento debe ser inferior o igual a la fecha actual.',
            'edad.min'                   => 'La edad debe ser un número positivo.',
            'edad.max'                   => 'La edad no puede ser mayor a 120 años.',
            'genero.in'                  => 'El género seleccionado no es válido.',
            'required'                   => 'El campo :attribute es obligatorio.',
            'numeric'                    => 'El campo :attribute debe ser numérico.',
            'digits'                     => 'El campo :attribute debe tener exactamente :digits dígitos.',
        ];
    }

    /**
     * Verificar si es modo fuerza bruta
     */
    private function isFuerzaBruta(Request $request)
    {
        return $request->boolean('fuerza_bruta');
    }

    /**
     * Limpiar tildes de una cadena
     */
    private function limpiarTildes($cadena)
    {
        if (!is_string($cadena)) {
            return $cadena;
        }
        $buscar = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'à', 'è', 'ì', 'ò', 'ù', 'À', 'È', 'Ì', 'Ò', 'Ù'];
        $reemplazo = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
        return str_replace($buscar, $reemplazo, $cadena);
    }

    /**
     * Limpiar y preparar los datos del request
     */
    private function limpiarYPrepararDatos(Request $request)
    {
        // Limpiar tildes de los campos de texto
        $camposTexto = ['nombre', 'snombre', 'apellido', 'sapellido', 'colonia', 'calle', 'municipio', 'genero'];
        
        foreach ($camposTexto as $campo) {
            if ($request->has($campo) && is_string($request->$campo)) {
                $request->merge([$campo => $this->limpiarTildes($request->$campo)]);
            }
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
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
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

        $beneficios = Beneficio::where('activo', true)
            ->get(['id', 'nombre', 'descripcion'])
            ->values()
            ->toArray();

        return Inertia::render('consulta', [
            'beneficiarios' => $beneficiarios,
            'beneficios'    => $beneficios,
            'filtros'       => $request->only(['nombre', 'snombre', 'apellido', 'sapellido', 'nacimiento'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $beneficios = Beneficio::where('activo', true)->get(['id', 'nombre', 'descripcion']);

        return Inertia::render('create', [
            'beneficios' => $beneficios
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Limpiar tildes de los datos
        $request = $this->limpiarYPrepararDatos($request);
        
        // 2. Validar los datos usando las reglas
        $datosValidados = $request->validate(
            $this->getReglasValidacion(),
            $this->getMensajesPersonalizados()
        );
        
        // 3. Extraer beneficios antes de guardar
        $beneficiosIds = $datosValidados['beneficios'] ?? [];
        unset($datosValidados['beneficios']);

        // 4. Formatear teléfono
        if (isset($datosValidados['telefono'])) {
            $datosValidados['telefono'] = $this->formatearTelefono($datosValidados['telefono']);
        }

        // 5. Convertir a mayúsculas (excepto campos específicos)
        $datosFinales = $this->convertirMayusculas($datosValidados);
        $datosFinales['id_user'] = Auth::id();

        // 6. Guardar en base de datos
        DB::beginTransaction();
        
        try {
            $nuevoRegistro = Registro::create($datosFinales);
            
            if (!empty($beneficiosIds)) {
                $nuevoRegistro->beneficios()->attach($beneficiosIds);
            }
            
            DB::commit();
            
            Log::info("Registro creado con éxito. ID: {$nuevoRegistro->id}, Usuario: " . Auth::id());
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Registro creado con éxito.',
                    'redirect' => route('dashboard')
                ]);
            }
            
            return redirect()->route('dashboard')->with('success', '¡Registro completado con éxito!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear registro: ' . $e->getMessage());
            
            if ($request->wantsJson()) {
                return response()->json([
                    'errors' => ['error' => 'Ocurrió un problema al guardar el registro: ' . $e->getMessage()]
                ], 500);
            }
            
            return back()
                ->withInput()
                ->withErrors(['error' => 'Ocurrió un problema al guardar el registro: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // 1. Encontrar el registro
        $beneficiario = Registro::findOrFail($id);
        
        // 2. Limpiar tildes de los datos
        $request = $this->limpiarYPrepararDatos($request);
        
        // 3. Validar los datos usando las reglas con el ID para excluir el registro actual
        $datosValidados = $request->validate(
            $this->getReglasValidacion($id),
            $this->getMensajesPersonalizados()
        );
        
        // 4. Extraer beneficios antes de actualizar
        $beneficiosIds = $datosValidados['beneficios'] ?? [];
        unset($datosValidados['beneficios']);

        // 5. Formatear teléfono
        if (isset($datosValidados['telefono'])) {
            $datosValidados['telefono'] = $this->formatearTelefono($datosValidados['telefono']);
        }

        // 6. Convertir a mayúsculas (excepto campos específicos)
        $datosFinales = $this->convertirMayusculas($datosValidados);
        $datosFinales['id_user'] = Auth::id();

        // 7. Actualizar en base de datos
        DB::beginTransaction();
        
        try {
            $beneficiario->update($datosFinales);
            $beneficiario->beneficios()->sync($beneficiosIds);
            
            DB::commit();
            
            Log::info("Registro actualizado con éxito. ID: {$id}, Usuario: " . Auth::id());
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Registro actualizado con éxito.'
                ]);
            }
            
            return redirect()->back()->with('success', 'Registro actualizado de forma correcta.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar registro ID ' . $id . ': ' . $e->getMessage());
            
            if ($request->wantsJson()) {
                return response()->json([
                    'errors' => ['error' => 'Ocurrió un problema al actualizar el registro: ' . $e->getMessage()]
                ], 500);
            }
            
            return redirect()->back()->withErrors([
                'error' => 'Ocurrió un error interno al procesar la actualización. Inténtelo de nuevo.'
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
            $beneficiario->beneficios()->detach();
            $beneficiario->delete();

            DB::commit();

            Log::info("Registro eliminado con éxito. ID: {$id}, Usuario: " . Auth::id());

            return redirect()->back()->with('success', 'El registro ha sido eliminado exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar registro ID ' . $id . ': ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'No se pudo eliminar el registro debido a dependencias en el sistema.'
            ]);
        }
    }
}
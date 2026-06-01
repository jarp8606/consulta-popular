<?php

namespace App\Http\Controllers;

use App\Models\cr;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Beneficio;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;




class BeneficioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
            $beneficios = Beneficio::all();

            return Inertia::render('beneficio/index', [
            'beneficios'    => $beneficios
            
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'     => 'required|string|max:255',
            'descripcion' => 'required|string',
            'activo'     => 'boolean',
        ]);

        // Transformación de datos
        $data = $this->convertirMayusculas($validated);
        $data['nombre']     = $this->limpiarTildes($data['nombre']);
        $data['descripcion'] = $this->limpiarTildes($data['descripcion']);
        $data['activo']     = $request->boolean('activo');

        DB::beginTransaction();
        try {
            Beneficio::create($data);
            DB::commit();

            return to_route('admin.beneficios.index')
                ->with('message', 'Beneficio guardado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear beneficio: ' . $e->getMessage());
            return back()->withErrors(['error' => 'No se pudo guardar el beneficio.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(cr $cr)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(cr $cr)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, cr $cr)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(cr $cr)
    {
        //
    }

        private function limpiarTildes($cadena)
    {
        if (!is_string($cadena)) {
            return $cadena;
        }
        $buscar = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'à', 'è', 'ì', 'ò', 'ù', 'À', 'È', 'Ì', 'Ò', 'Ù'];
        $reemplazo = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
        return str_replace($buscar, $reemplazo, $cadena);
    }

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
}

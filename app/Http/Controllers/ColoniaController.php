<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class ColoniaController extends Controller
{
    /**
     * Helper privado para limpiar y preparar el string de búsqueda.
     */
    private function prepararBusqueda(?string $texto): string
    {
        // 1. Quitamos espacios innecesarios al inicio y final
        $textoLimpio = trim($texto ?? '');

        // 2. Escapamos caracteres comodín de SQL (_, %) para evitar ataques de denegación de servicio (DoS)
        $textoEscapado = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $textoLimpio);

        // 3. Reemplazamos espacios internos por comodines para mejorar la coincidencia (ej: "centro taray" -> "%centro%taray%")
        return '%' . str_replace(' ', '%', $textoEscapado) . '%';
    }

    // 🏘️ Buscador de Colonias
    public function buscar(Request $request)
    {
        try {
            $q = $request->input('q');

            // Validación estricta usando trim para ignorar espacios vacíos en el conteo
            if (empty($q) || strlen(trim($q)) < 2) {
                return response()->json([]);
            }

            $busquedaLimpia = $this->prepararBusqueda($q);

            $colonias = DB::table('colonias')
                ->where('nombre_de_la_colonia', 'ILIKE', $busquedaLimpia)
                ->select(
                    'id', 
                    'nombre_de_la_colonia as nombre', 
                    'seccion', 
                    'nombre_del_municipio as municipio'
                )            
                ->limit(10)
                ->get();

            return response()->json($colonias);

        } catch (Exception $e) {
            // Registramos el error internamente sin exponer detalles sensibles al cliente
            Log::error("Error en ColoniaController@buscar: " . $e->getMessage());
            return response()->json(['error' => 'Ocurrió un error al procesar la búsqueda.'], 500);
        }
    }

    // 🛣️ Buscador de Calles
    public function buscarCalle(Request $request)
    {
        try {
            $q = $request->input('q');

            if (empty($q) || strlen(trim($q)) < 2) {
                return response()->json([]);
            }

            $busquedaLimpia = $this->prepararBusqueda($q);

            $calles = DB::table('calles_aguascalientes') 
                ->where('nombre', 'ILIKE', $busquedaLimpia)
                ->select('nombre', 'tipo') // 🌟 Tip: Asegúrate de mandar siempre el ID para las "keys" de React
                ->limit(10)
                ->get();

            return response()->json($calles);

        } catch (Exception $e) {
            Log::error("Error en ColoniaController@buscarCalle: " . $e->getMessage());
            return response()->json(['error' => 'Ocurrió un error al procesar la búsqueda.'], 500);
        }
    }   
}
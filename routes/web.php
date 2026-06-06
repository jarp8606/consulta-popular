<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RegistroController;
use App\Http\Controllers\ColoniaController;
use App\Http\Controllers\Admin\UserController; 
use App\Http\Controllers\BeneficioController;
use App\Http\Controllers\Admin\PreguntaController; // ← RUTA CORREGIDA
use App\Models\Registro;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

// --- RUTA DE PRUEBA DE CONEXIÓN (Pública) ---
Route::get('/test-conexion', function () {
    try {
        DB::connection()->getPdo();
        return "¡Conexión a AWS exitosa! Todo está configurado correctamente.";
    } catch (\Exception $e) {
        return "Error de conexión: " . $e->getMessage();
    }
});

// --- RUTA DE LIMPIEZA (Para solucionar errores de caché tras deploy) ---
Route::get('/limpiar-todo', function () {
    Artisan::call('route:clear');
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    return "Caché, rutas y configuración limpiadas.";
});

// Ruta principal
Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

// Rutas protegidas por autenticación estándar (Sesiones)
Route::middleware(['auth'])->group(function () {
    
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    // 1. RUTAS DE CONSULTA
    Route::middleware(['can:ver registros'])->group(function () {
        Route::get('consulta/buscar', [RegistroController::class, 'index'])->name('consulta.index');
        Route::get('api/colonias/buscar', [ColoniaController::class, 'buscar'])->name('api.colonias.buscar');
        Route::get('api/calles/buscar', [ColoniaController::class, 'buscarCalle'])->name('api.calles.buscar');
        Route::get('api/beneficiarios/{id}/beneficios', function ($id) {
            return Registro::findOrFail($id)->beneficios()->pluck('beneficios.id');
        })->name('api.beneficiarios.beneficios');

        Route::get('api/beneficiarios/{id}/respuestas', function ($id) {
            $beneficiario = Registro::with(['respuestas.catalogo'])->findOrFail($id);
            return response()->json($beneficiario->respuestas);
        })->name('api.beneficiarios.respuestas');
    });

    // 2. RUTAS DE CREACIÓN Y EDICIÓN
    Route::middleware(['can:crear registros', 'can:editar registros'])->group(function () {
        Route::get('consulta/registro', [RegistroController::class, 'create'])->name('consulta.create');
        Route::post('consulta/registro', [RegistroController::class, 'store'])->name('consulta.store');
        Route::put('consulta/actualizar/{id}', [RegistroController::class, 'update'])->name('consulta.update');
        Route::delete('/consulta/{id}', [RegistroController::class, 'destroy'])->name('consulta.destroy');
    });

    // 3. RUTAS DE ADMINISTRACIÓN
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/usuarios', [UserController::class, 'index'])->name('admin.users.index');
        Route::post('/admin/usuarios', [UserController::class, 'store'])->name('admin.users.store');
        Route::resource('/admin/beneficio', BeneficioController::class)->names('admin.beneficios');
    });

    // 4. RUTAS DE PREGUNTAS (Estructura: /preguntas)
    Route::middleware(['role:admin'])->prefix('preguntas')->name('preguntas.')->group(function () {
        Route::get('/', [PreguntaController::class, 'index'])->name('index');
        Route::get('/create', [PreguntaController::class, 'create'])->name('create');
        Route::post('/', [PreguntaController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [PreguntaController::class, 'edit'])->name('edit');
        Route::put('/{id}', [PreguntaController::class, 'update'])->name('update');
        Route::delete('/{id}', [PreguntaController::class, 'destroy'])->name('destroy');
        Route::patch('/{id}/toggle', [PreguntaController::class, 'toggle'])->name('toggle');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
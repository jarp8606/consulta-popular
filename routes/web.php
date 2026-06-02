<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RegistroController;
use App\Http\Controllers\ColoniaController;
use App\Http\Controllers\Admin\UserController; 
use App\Http\Controllers\BeneficioController; 
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
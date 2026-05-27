<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RegistroController;
use App\Http\Controllers\ColoniaController;
use App\Http\Controllers\Admin\UserController; 
use App\Models\Registro;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

// Rutas protegidas por autenticación
Route::middleware(['auth'])->group(function () {
    
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    // 1. RUTAS DE CONSULTA (Para todos los roles: 'consulta', 'registro', 'admin')
    Route::middleware(['can:ver registros'])->group(function () {
        Route::get('consulta/buscar', [RegistroController::class, 'index'])->name('consulta.index');
        Route::get('api/colonias/buscar', [ColoniaController::class, 'buscar'])->name('api.colonias.buscar');
        Route::get('api/calles/buscar', [ColoniaController::class, 'buscarCalle'])->name('api.calles.buscar');
        Route::get('api/beneficiarios/{id}/beneficios', function ($id) {
            return Registro::findOrFail($id)->beneficios()->pluck('beneficios.id');
        })->name('api.beneficiarios.beneficios');
    });

    // 2. RUTAS DE CREACIÓN Y EDICIÓN (Solo 'registro' y 'admin')
    Route::middleware(['can:crear registros', 'can:editar registros'])->group(function () {
        Route::get('consulta/registro', [RegistroController::class, 'create'])->name('consulta.create');
        Route::post('consulta/registro', [RegistroController::class, 'store'])->name('consulta.store');
        Route::put('consulta/actualizar/{id}', [RegistroController::class, 'update'])->name('consulta.update');
        Route::delete('/consulta/{id}', [RegistroController::class, 'destroy'])->name('consulta.destroy');

    });

    // 3. RUTAS DE ADMINISTRACIÓN Y ELIMINACIÓN (Solo 'admin')
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/usuarios', [UserController::class, 'index'])->name('admin.users.index');
        Route::post('/admin/usuarios', [UserController::class, 'store'])->name('admin.users.store');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
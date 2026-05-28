<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void {
        // 1. Crear o asegurar el rol
        $role = Role::firstOrCreate(['name' => 'admin']);

        // 2. Crear el usuario
        $user = User::firstOrCreate(
            ['email' => 'jarp@gmail.com'],
            [
                'name' => 'pedro silva',
                'password' => Hash::make('Mexico2026'),
            ]
        );

        // 3. Asignar el rol
        $user->assignRole($role);
    }

    public function down(): void {
        // Opcional: borrar el usuario si se hace rollback
        User::where('email', 'jarp.8606@gmail.com')->delete();
    }
};

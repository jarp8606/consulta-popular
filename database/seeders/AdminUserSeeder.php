<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
public function run(): void
{
    // 1. Borramos el usuario si ya existe (así evitamos el error de duplicado)
  

    // 2. Creamos el usuario desde cero
    $user = \App\Models\User::create([
        'name' => 'pedro silva',
        'email' => 'jarp@gmail.com',
        'password' => Hash::make('Mexico2026'),
    ]);

    // 3. Asignamos el rol
    $role = Role::firstOrCreate(['name' => 'admin']);
    $user->assignRole($role);
}
}

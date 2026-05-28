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
        //if (!User::where('email', 'admin@ejemplo.com')->exists()) {
        $role = Role::firstOrCreate(['name' => 'admin']);

        // 2. Creamos o buscamos al usuario
        $user = User::firstOrCreate(
            ['email' => 'jarp.8606@gmail.com'],
            [
                'name' => 'pedro silva',
                'password' => Hash::make('Mexico2026'),
            ]
        );

        // 3. Asignamos el rol al usuario
        $user->assignRole($role);
    }
}

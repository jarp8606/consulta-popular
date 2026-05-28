<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ELIMINACIÓN AGRESIVA: Borramos el usuario de prueba antes de empezar
        User::where('email', 'test@example.com')->delete();

        // 2. Aseguramos el rol
        $role = Role::firstOrCreate(['name' => 'admin']);

        $admins = [
            [
                'email' => 'jarp@gmail.com',
                'name' => 'pedro silva'
            ]
            // Ya no incluimos test@example.com aquí, porque lo borramos arriba
        ];

        foreach ($admins as $adminData) {
            $user = User::updateOrCreate(
                ['email' => $adminData['email']],
                [
                    'name' => $adminData['name'],
                    'password' => Hash::make('Mexico2026'),
                ]
            );

            if (!$user->hasRole('admin')) {
                $user->assignRole($role);
            }
        }
    }
}

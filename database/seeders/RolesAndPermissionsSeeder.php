<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Limpiar caché
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Crear Permisos (Pasa solo el string directamente)
        Permission::findOrCreate('ver registros');
        Permission::findOrCreate('crear registros');
        Permission::findOrCreate('editar registros');
        Permission::findOrCreate('eliminar registros');

        // 3. Crear Roles y asignar permisos

        // Admin: Tiene acceso a todo
        $admin = Role::findOrCreate('admin');
        $admin->givePermissionTo(Permission::all());

        // Registro: Crea, ve y edita
        $registrador = Role::findOrCreate('registro');
        $registrador->givePermissionTo(['crear registros', 'ver registros', 'editar registros']);

        // Consulta: Solo ve
        $consulta = Role::findOrCreate('consulta');
        $consulta->givePermissionTo('ver registros');
    }
}

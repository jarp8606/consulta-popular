<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Mostrar la lista de usuarios y el formulario
    public function index()
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::with('roles')->get(),
            'roles' => Role::all(), // Enviamos los roles (lector, editor, etc.)
        ]);
    }

    // Guardar el nuevo usuario con su permiso
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|min:8',
            'role'     => 'required' // El nombre del rol seleccionado
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Asignamos el rol de Spatie
        $user->assignRole($request->role);

        return back()->with('message', 'Usuario creado con éxito.');
    }
}
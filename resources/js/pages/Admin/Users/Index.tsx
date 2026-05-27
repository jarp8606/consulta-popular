import React from 'react';
import AppLayout from '@/layouts/app-layout';
import InputField from '@/components/input-field';
import { useForm, router ,Link} from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react'; // Necesitarás instalar lucide-react si no lo tienes

export default function UserIndex({ roles, users }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), { onSuccess: () => reset() });
    };

    const deleteUser = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            router.delete(route('consulta.destroy', id)); // Asegúrate de que esta ruta exista
        }
    };

    return (
        <AppLayout>
            <div className="w-full px-6 py-6"> {/* w-full para ancho completo */}
                <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>

                {/* Formulario */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Registrar Nuevo Encuestador</h2>
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <InputField label="Nombre" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />
                        <InputField label="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                        <InputField label="Contraseña" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                        
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-1">Rol</label>
                            <select className="w-full px-3 py-2 border rounded-lg" value={data.role} onChange={(e) => setData('role', e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {roles.map((role: any) => (
                                    <option key={role.id} value={role.name}>{role.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
<div className="md:col-span-4 flex justify-start gap-3 mt-8"> {/* <--- AQUÍ AÑADIMOS mt-8 */}    <button 
        disabled={processing}
        className="bg-[#1FB7E9] text-white px-5 py-2 text-sm rounded-md hover:bg-[#152844] transition-colors"
    >
        {processing ? 'Registrando...' : 'Registrar Usuario'}
    </button>
    
    {/* Botón Cancelar */}
    <Link 
        href="/dashboard" 
        className="bg-gray-200 text-gray-700 px-5 py-2 text-sm rounded-md hover:bg-gray-300 transition-colors"
    >
        Cancelar
    </Link>
</div>
                    </form>
                </div>

                {/* Tabla Ancha */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <table className="w-full text-left table-auto">
                        <thead className="bg-blue-600 border-b">
                            <tr className='text-white'>
                                <th className="px-6 py-3 text-sm font-bold">Usuario</th>
                                <th className="px-6 py-3 text-sm font-bold">Email</th>
                                <th className="px-6 py-3 text-sm font-bold">Rol</th>
                                <th className="px-6 py-3 text-sm font-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm">{user.name}</td>
                                    <td className="px-6 py-4 text-sm">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                                            {user.roles[0]?.name || 'Sin Rol'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                                        <button className="text-blue-600 hover:text-blue-900 p-2">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900 p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
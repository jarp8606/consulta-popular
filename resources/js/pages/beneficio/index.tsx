import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react'; // Necesitarás instalar lucide-react si no lo tienes




interface Beneficio {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
}

interface Props {
    beneficios: Beneficio[];
}

export default function CreateBeneficio({ beneficios }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        descripcion: '',
        activo: true,
    });

   

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.beneficios.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Gestión de Beneficios" />

            <div className="w-full space-y-8 px-6 py-6">
                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Beneficios</h1>
                    <p className="text-gray-600">Registra y administra los beneficios del sistema.</p>
                </div>

                {/* Formulario */}
                <form onSubmit={submit} className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Nombre del Beneficio</label>
                            <input
                                className={`w-full rounded-lg border p-3 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej. Despensa Familiar"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                            />
                            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Descripción</label>
                            <input
                                className={`w-full rounded-lg border p-3 ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej. Descripción detallada"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                            />
                            {errors.descripcion && <p className="mt-1 text-xs text-red-500">{errors.descripcion}</p>}
                        </div>
                    </div>



                    <div className="mt-6 flex items-center justify-between">
                        {/* Este div ocupa el espacio de la izquierda (Checkbox) */}
                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.activo}
                                onChange={(e) => setData('activo', e.target.checked)}
                                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{data.activo ? 'Activo' : 'Inactivo'}</span>
                        </label>

                        {/* Este div envuelve a los botones y los alinea a la derecha */}
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('admin.beneficios.index')}
                                className="rounded-lg px-4 py-2 text-gray-600 transition duration-200 hover:bg-gray-100 hover:text-gray-900"
                            >
                                Cancelar
                            </Link>

                            <button
                                disabled={processing}
                                className={`rounded-lg px-6 py-2 font-medium text-white transition ${processing ? 'cursor-not-allowed bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {processing ? 'Guardando...' : 'Guardar Beneficio'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Tabla de Listado */}
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Descripción</th>
                                <th className="px-6 py-4">Estatus</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {beneficios.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{b.nombre}</td>
                                    <td className="px-6 py-4 text-gray-600">{b.descripcion}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${b.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                        >
                                            {b.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                                        <button className="text-blue-600 hover:text-blue-900 p-2" title="Editar beneficio">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900 p-2" title="Eliminar beneficio">
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

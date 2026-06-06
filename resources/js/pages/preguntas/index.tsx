import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface Pregunta {
    id: number;
    descripcion: string;
    activa: boolean;
    created_at: string;
    updated_at: string;
}

declare const route: any;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Preguntas', href: '#' },
];

export default function PreguntasIndex() {
    const { props } = usePage<any>();
    const preguntas: Pregunta[] = props.preguntas || [];
    const [searchTerm, setSearchTerm] = useState('');

    const preguntasFiltradas = preguntas.filter(pregunta =>
        pregunta.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = async (id: number, activa: boolean) => {
        try {
            const response = await fetch(route('preguntas.toggle', id), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                MySwal.fire({
                    title: '¡Estado Actualizado!',
                    text: data.message,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                router.reload();
            }
        } catch (error) {
            MySwal.fire({
                title: 'Error',
                text: 'No se pudo cambiar el estado de la pregunta',
                icon: 'error',
                confirmButtonColor: '#EF4444'
            });
        }
    };

    const handleDelete = (id: number, descripcion: string) => {
        MySwal.fire({
            title: '¿Está seguro de eliminar?',
            html: `La pregunta <strong>"${descripcion.substring(0, 100)}${descripcion.length > 100 ? '...' : ''}"</strong> se eliminará permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('preguntas.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        MySwal.fire({
                            title: '¡Eliminado!',
                            text: 'La pregunta ha sido eliminada.',
                            icon: 'success',
                            confirmButtonColor: '#1FB7E9'
                        });
                    },
                    onError: (errors) => {
                        MySwal.fire({
                            title: 'Error',
                            text: (errors as any).error || 'No se pudo eliminar la pregunta',
                            icon: 'error',
                            confirmButtonColor: '#EF4444'
                        });
                    }
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Preguntas" />

            <div className="w-full space-y-6 p-10">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Gestión de Preguntas</h1>
                        <p className="text-sm text-neutral-500 mt-1">Administra las preguntas de evaluación social</p>
                    </div>
                    <a
                        href={route('preguntas.create')}
                        className="rounded-lg bg-[#1FB7E9] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#1699c2] hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] inline-flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Pregunta
                    </a>
                </div>

                {/* Tabla de preguntas */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-8 pt-6 pb-4 border-b border-neutral-100 bg-gradient-to-r from-white to-neutral-50">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-neutral-800">Listado de Preguntas</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar pregunta..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:border-[#1FB7E9] focus:outline-none focus:ring-2 focus:ring-[#1FB7E9]/20 w-64"
                                />
                                <svg className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-700">
                            <thead className="bg-neutral-100 text-xs font-semibold text-neutral-600 border-b border-neutral-200 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Pregunta</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {preguntasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-400 italic">
                                            {searchTerm ? 'No se encontraron preguntas con ese criterio' : 'No hay preguntas registradas'}
                                        </td>
                                    </tr>
                                ) : (
                                    preguntasFiltradas.map((pregunta, index) => (
                                        <tr key={pregunta.id} className="hover:bg-neutral-50/80 transition-colors duration-200">
                                            <td className="px-6 py-4 font-medium text-neutral-900">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-md whitespace-pre-wrap">
                                                    {pregunta.descripcion}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(pregunta.id, pregunta.activa)}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                                        pregunta.activa
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {pregunta.activa ? 'Activa' : 'Inactiva'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a
                                                        href={route('preguntas.edit', pregunta.id)}
                                                        className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 inline-flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(pregunta.id, pregunta.descripcion)}
                                                        className="rounded-lg bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 inline-flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="flex justify-between items-center text-xs text-neutral-500 bg-neutral-50 px-6 py-3 rounded-lg">
                    <div>Total: <span className="font-semibold text-neutral-700">{preguntas.length}</span> preguntas</div>
                    <div>Activas: <span className="font-semibold text-green-700">{preguntas.filter(p => p.activa).length}</span></div>
                    <div>Inactivas: <span className="font-semibold text-red-700">{preguntas.filter(p => !p.activa).length}</span></div>
                </div>
            </div>
        </AppLayout>
    );
}
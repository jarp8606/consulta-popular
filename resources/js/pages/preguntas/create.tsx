import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface BreadcrumbItem {
    title: string;
    href: string;
}

declare const route: any;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Preguntas', href: route('preguntas.index') },
    { title: 'Nueva Pregunta', href: '#' },
];

export default function PreguntasCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        descripcion: '',
        activa: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('preguntas.store'), {
            preserveScroll: true,
            onSuccess: () => {
                MySwal.fire({
                    title: '¡Pregunta Creada!',
                    text: 'La pregunta ha sido registrada exitosamente.',
                    icon: 'success',
                    confirmButtonColor: '#1FB7E9',
                    timer: 2000
                });
                reset();
            },
            onError: (errors) => {
                MySwal.fire({
                    title: 'Error',
                    text: Object.values(errors).join(', '),
                    icon: 'error',
                    confirmButtonColor: '#EF4444'
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Pregunta" />

            <div className="w-full space-y-6 p-10">
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-8 pt-6 pb-4 border-b border-neutral-100 bg-gradient-to-r from-white to-neutral-50">
                        <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Crear Nueva Pregunta</h2>
                        <p className="text-sm text-neutral-500 mt-1">Complete los datos de la pregunta de evaluación</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <h3 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-200">Datos de la Pregunta</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                            Pregunta <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.descripcion}
                                            onChange={(e) => setData('descripcion', e.target.value)}
                                            rows={4}
                                            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-[#1FB7E9] focus:outline-none focus:ring-2 focus:ring-[#1FB7E9]/20 transition-all resize-none"
                                            placeholder="Ej: ¿USTED FORMA PARTE DE ALGÚN CLUB CULTURAL O DEPORTIVO?"
                                        />
                                        <p className="mt-1 text-xs text-neutral-500">
                                            La pregunta debe ser clara y específica. Se mostrará en mayúsculas en el formulario.
                                        </p>
                                        {errors.descripcion && (
                                            <p className="mt-1 text-xs text-red-600">{errors.descripcion}</p>
                                        )}
                                    </div>

                                    <div className="bg-neutral-50 p-4 rounded-lg">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.activa}
                                                onChange={(e) => setData('activa', e.target.checked)}
                                                className="w-4 h-4 rounded border-neutral-300 text-[#1FB7E9] focus:ring-[#1FB7E9]"
                                            />
                                            <span className="text-sm font-medium text-neutral-700">Pregunta activa</span>
                                        </label>
                                        <p className="mt-2 text-xs text-neutral-500 ml-7">
                                            Las preguntas inactivas no se mostrarán en el formulario de registro de beneficiarios
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200">
                                <a
                                    href={route('preguntas.index')}
                                    className="rounded-lg border-2 border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200"
                                >
                                    Cancelar
                                </a>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-[#1FB7E9] px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#1699c2] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] inline-flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : (
                                        'Crear Pregunta'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
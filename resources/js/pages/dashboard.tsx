import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const { auth } = usePage().props as any;
    
    // Fallback seguro: si auth.user o roles no existen, devolvemos array vacío
    const userRoles = auth?.user?.roles || [];
    
    const isAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
    const isConsulta = Array.isArray(userRoles) && userRoles.includes('consulta');
    const isRegistro = Array.isArray(userRoles) && userRoles.includes('registro');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    
                    {/* CUADRO 1: Registro (Solo Admin) */}
                    {(isAdmin || isRegistro  || isConsulta ) && (
                        <Link 
                            href='/consulta/registro' 
                            className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#1FB7E9] p-6 text-center transition hover:opacity-90"
                        >
                            <span className="text-lg font-semibold text-white">Registro de Consulta Popular</span>
                        </Link>
                    )}

                    {/* CUADRO 2: Consultar Usuario (Admin o Editor) */}
                    {(isAdmin || isRegistro) && (
                        <Link 
                            href={route('consulta.index')} 
                            className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#FEE11B] p-6 text-center transition hover:opacity-90"
                        >
                            <span className="text-lg font-semibold text-white">Consultar Usuario</span>
                        </Link>
                    )}

                    {/* CUADRO 3: Otros (Solo Admin) */}
                    {isAdmin && (
                        <Link 
                            href='/blank' 
                            className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#E90481] p-6 text-center transition hover:opacity-90"
                        >
                            <span className="text-lg font-semibold text-white">Otros</span>
                        </Link>
                    )}
                </div>

                <div className="relative flex min-h-[100vh] flex-1 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-slate-50 p-8 md:min-h-min">
                    {/* Imagen de fondo centrada con colchón de espacio */}
                    <img src="images/gobierno.webp" alt="Fondo Gobierno" className="pointer-events-none max-h-full max-w-full object-contain" />

                    {/* Contenido superior (opcional) */}
                    <div className="pointer-events-none absolute inset-0 z-10 p-6">
                        {/* Si vas a poner texto aquí, agrégale 'pointer-events-auto' a sus contenedores */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
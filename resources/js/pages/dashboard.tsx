import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Link href='consulta/registro' className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#1FB7E9] p-6 text-center">
                        <span className="text-lg font-semibold text-white">Registro de Consulta Popular</span>
                    </Link>
                    <Link href={route('consulta.index')} className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#FEE11B] p-6 text-center">
                        <span className="text-lg font-semibold text-white">Consultar Usuario</span>
                    </Link>
                    <Link href='blank' className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#E90481] p-6 text-center">
                        <span className="text-lg font-semibold text-white">Otros</span>
                    </Link>
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

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react'; // Asegúrate de importar usePage
import { LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    // Obtenemos los props compartidos desde Inertia (HandleInertiaRequests)
    const { auth } = usePage<any>().props;
    console.log("Datos de autenticación:", auth);
    console.log("Roles del usuario:", auth.user?.roles);

    // Construimos el array de forma dinámica dentro del componente
    const footerNavItems: NavItem[] = [];

    // Lógica condicional: solo agregamos el ítem si el usuario es admin
    if (auth.user?.roles?.includes('admin')) {
        footerNavItems.push({
            title: 'Agregar encuestador',
            url: route('admin.users.index'),
            icon: Users,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* Solo renderizamos el footer si hay ítems que mostrar */}
                {footerNavItems.length > 0 && (
                    <NavFooter items={footerNavItems} className="mt-auto" />
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
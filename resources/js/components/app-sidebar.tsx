import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { LayoutGrid, LogOut, Notebook, Users, HelpCircle } from 'lucide-react'; // Agregar HelpCircle o Question icon
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;

    const { post } = useForm();

    const handleLogout = () => {
        post(route('logout'));
    };

    const footerNavItems: NavItem[] = [];

    if (auth.user?.roles?.includes('admin')) {
        footerNavItems.push(
            {
                title: 'Agregar Beneficio',
                url: route('admin.beneficios.index'),
                icon: Notebook,
            },
            {
                title: 'Agregar Encuestador',
                url: route('admin.users.index'),
                icon: Users,
            },
            {
                title: 'Gestionar Preguntas',
                url: route('preguntas.index'), // Cambiado a preguntas.index
                icon: HelpCircle, // Icono corregido
            },
        );
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
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}

                <NavUser />

                <SidebarMenuButton onClick={handleLogout} className="font-medium text-red-600 hover:text-red-700">
                    <LogOut className="size-4" />
                    <span>Cerrar Sesión</span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}
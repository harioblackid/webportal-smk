import { Link, usePage } from '@inertiajs/react';
import {
    ExternalLink,
    FileText,
    GraduationCap,
    Images,
    LayoutDashboard,
    LayoutTemplate,
    Settings,
    Tags,
    Users,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { home } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as heroesIndex } from '@/routes/admin/heroes';
import { index as majorsIndex } from '@/routes/admin/majors';
import { index as mediaIndex } from '@/routes/admin/media';
import { index as postsIndex } from '@/routes/admin/posts';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as usersIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

type AdminNavItem = NavItem & {
    /** Hidden from Editors — the route answers 403 for them anyway (FR5-2). */
    superadmin?: boolean;
};

const contentNavItems: AdminNavItem[] = [
    { title: 'Dasbor', href: dashboard(), icon: LayoutDashboard },
    { title: 'Berita', href: postsIndex(), icon: FileText },
    { title: 'Kategori', href: categoriesIndex(), icon: Tags },
    { title: 'Hero', href: heroesIndex(), icon: LayoutTemplate },
    { title: 'Media', href: mediaIndex(), icon: Images },
];

const manageNavItems: AdminNavItem[] = [
    {
        title: 'Jurusan',
        href: majorsIndex(),
        icon: GraduationCap,
        superadmin: true,
    },
    {
        title: 'Pengaturan',
        href: settingsEdit(),
        icon: Settings,
        superadmin: true,
    },
    { title: 'Pengguna', href: usersIndex(), icon: Users, superadmin: true },
];

const footerNavItems: NavItem[] = [
    { title: 'Lihat situs', href: home(), icon: ExternalLink },
];

export function AppSidebar() {
    const user = usePage().props.auth.user;
    const { currentUrl, isCurrentUrl } = useCurrentUrl();

    const isSuperadmin = user?.role === 'superadmin';

    const dashboardUrl = toUrl(dashboard());

    const withActive = (items: AdminNavItem[]) =>
        items
            .filter((item) => item.superadmin !== true || isSuperadmin)
            .map((item) => ({
                ...item,
                isActive:
                    toUrl(item.href) === dashboardUrl
                        ? isCurrentUrl(item.href)
                        : currentUrl.startsWith(toUrl(item.href)),
            }));

    const manage = withActive(manageNavItems);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Konten" items={withActive(contentNavItems)} />

                {manage.length > 0 && <NavMain label="Kelola" items={manage} />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

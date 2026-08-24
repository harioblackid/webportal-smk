import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    FileText,
    GraduationCap,
    Images,
    LayoutDashboard,
    LogOut,
    LayoutTemplate,
    Settings,
    Tags,
    Users,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import FlashToast from '@/components/admin/flash-toast';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as heroesIndex } from '@/routes/admin/heroes';
import { index as majorsIndex } from '@/routes/admin/majors';
import { index as mediaIndex } from '@/routes/admin/media';
import { index as postsIndex } from '@/routes/admin/posts';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as usersIndex } from '@/routes/admin/users';

type AdminLayoutProps = {
    title: string;
    /** Page-level buttons (Tulis berita, Simpan, …), right of the heading. */
    actions?: ReactNode;
    children: ReactNode;
};

type NavItem = {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    superadmin?: boolean;
};

/** prd-05 §2, in the order the sidebar shows them. */
const NAV: NavItem[] = [
    { label: 'Dasbor', href: dashboard.url(), icon: LayoutDashboard },
    { label: 'Berita', href: postsIndex.url(), icon: FileText },
    { label: 'Kategori', href: categoriesIndex.url(), icon: Tags },
    { label: 'Hero', href: heroesIndex.url(), icon: LayoutTemplate },
    { label: 'Media', href: mediaIndex.url(), icon: Images },
    {
        label: 'Jurusan',
        href: majorsIndex.url(),
        icon: GraduationCap,
        superadmin: true,
    },
    {
        label: 'Pengaturan',
        href: settingsEdit.url(),
        icon: Settings,
        superadmin: true,
    },
    {
        label: 'Pengguna',
        href: usersIndex.url(),
        icon: Users,
        superadmin: true,
    },
];

export default function AdminLayout({
    title,
    actions,
    children,
}: AdminLayoutProps) {
    const page = usePage();
    const user = page.props.auth.user;
    const form = useForm({});

    // FR5-2 is enforced server-side; hiding these links is only a courtesy so
    // Editors are not sent to a page that will answer 403.
    const isSuperadmin = user?.role === 'superadmin';
    const items = NAV.filter(
        (item) => item.superadmin !== true || isSuperadmin,
    );

    const current = (href: string) =>
        href === dashboard.url()
            ? page.url === href
            : page.url.startsWith(href);

    return (
        <>
            <Head title={title}>
                {/* Belt and braces alongside the X-Robots-Tag header (FR5-5). */}
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="min-h-screen bg-white">
                <header className="bg-brand text-white">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 sm:px-6">
                        <Link
                            href={dashboard()}
                            className="inline-flex min-h-11 items-center font-display text-lg font-semibold"
                        >
                            Admin Portal
                        </Link>

                        <div className="ml-auto flex items-center gap-3 text-sm">
                            <span className="hidden sm:inline">
                                {user?.name}
                            </span>

                            <button
                                type="button"
                                onClick={() => form.post(logout.url())}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium hover:bg-brand-accent"
                            >
                                <LogOut className="size-4" aria-hidden="true" />
                                Keluar
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 sm:px-6 lg:flex-row lg:gap-10">
                    {/* Horizontal and scrollable on phones, a sidebar from lg
                        up — prd-05 §5 keeps admin usable on small screens
                        without spending the mobile-first budget on it. */}
                    <nav
                        aria-label="Menu admin"
                        className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:w-52 lg:shrink-0 lg:overflow-visible lg:px-0"
                    >
                        <ul className="flex gap-1 lg:flex-col">
                            {items.map(({ label, href, icon: Icon }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        aria-current={
                                            current(href) ? 'page' : undefined
                                        }
                                        className={cn(
                                            'inline-flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap',
                                            current(href)
                                                ? 'bg-mist text-onyx'
                                                : 'text-charcoal hover:bg-mist/60 hover:text-onyx',
                                        )}
                                    >
                                        <Icon
                                            className="size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <main className="min-w-0 flex-1">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <h1 className="font-display text-2xl font-semibold text-onyx sm:text-3xl">
                                {title}
                            </h1>

                            {actions ? (
                                <div className="flex flex-wrap gap-2">
                                    {actions}
                                </div>
                            ) : null}
                        </div>

                        <FlashToast />

                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

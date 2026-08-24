import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { logout } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as usersIndex } from '@/routes/admin/users';

type AdminLayoutProps = {
    title: string;
    children: ReactNode;
};

export default function AdminLayout({ title, children }: AdminLayoutProps) {
    const user = usePage().props.auth.user;
    const form = useForm({});

    // FR5-2 is enforced server-side; hiding this link is only a courtesy so
    // Editors are not sent to a page that will answer 403.
    const isSuperadmin = user?.role === 'superadmin';

    return (
        <>
            <Head title={title}>
                {/* Belt and braces alongside the X-Robots-Tag header (FR5-5). */}
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="min-h-screen bg-white">
                <header className="bg-brand text-white">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-6">
                        <Link
                            href={dashboard()}
                            className="inline-flex min-h-11 items-center font-display text-lg font-semibold"
                        >
                            Admin Portal
                        </Link>

                        <nav
                            aria-label="Menu admin"
                            className="flex items-center gap-1"
                        >
                            <Link
                                href={dashboard()}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-brand-accent"
                            >
                                <LayoutDashboard
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Dasbor
                            </Link>

                            {isSuperadmin ? (
                                <Link
                                    href={usersIndex()}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-brand-accent"
                                >
                                    <Users
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Pengguna
                                </Link>
                            ) : null}
                        </nav>

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

                <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
                    <h1 className="font-display text-2xl font-semibold text-onyx sm:text-3xl">
                        {title}
                    </h1>

                    <div className="mt-6">{children}</div>
                </main>
            </div>
        </>
    );
}

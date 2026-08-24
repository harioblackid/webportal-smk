import { Head, Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';

import { home } from '@/routes';

type AuthLayoutProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

export default function AuthLayout({
    title,
    description,
    children,
}: AuthLayoutProps) {
    return (
        <>
            <Head title={title} />

            <div className="flex min-h-screen flex-col bg-mist px-5 py-10 sm:px-6">
                <header className="mx-auto w-full max-w-md">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-charcoal hover:text-brand"
                    >
                        <GraduationCap className="size-5" aria-hidden="true" />
                        SMK PGRI Telagasari
                    </Link>
                </header>

                <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                    <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                        <h1 className="font-display text-2xl font-semibold text-onyx">
                            {title}
                        </h1>

                        {description ? (
                            <p className="mt-2 text-sm text-charcoal">
                                {description}
                            </p>
                        ) : null}

                        <div className="mt-6">{children}</div>
                    </div>
                </main>
            </div>
        </>
    );
}

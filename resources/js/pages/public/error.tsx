import { Link } from '@inertiajs/react';

import { buttonClasses } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { home } from '@/routes';
import { index as postsIndex } from '@/routes/posts';
import type { Seo } from '@/types';

type ErrorProps = {
    status: number;
    seo: Seo;
};

const messages: Record<number, { title: string; body: string }> = {
    404: {
        title: 'Halaman tidak ditemukan',
        body: 'Tautannya mungkin sudah berubah, atau halaman ini memang tidak pernah ada. Mari kembali ke jalur yang benar.',
    },
};

/** FR4-21 — a 404 that offers a way back to Home and Berita. */
export default function ErrorPage({ status, seo }: ErrorProps) {
    const message = messages[status] ?? {
        title: 'Terjadi kesalahan',
        body: 'Silakan coba beberapa saat lagi.',
    };

    return (
        <PublicLayout seo={seo}>
            <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:py-24">
                <p
                    className="font-display text-6xl font-semibold text-brand/25 sm:text-8xl"
                    aria-hidden="true"
                >
                    {status}
                </p>

                <h1 className="mt-4 font-display text-[30px] leading-tight font-semibold text-onyx sm:text-4xl">
                    {message.title}
                </h1>

                <p className="mt-4 max-w-xl text-base text-charcoal">
                    {message.body}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={home()} className={buttonClasses('primary')}>
                        Kembali ke beranda
                    </Link>

                    <Link
                        href={postsIndex()}
                        className={buttonClasses('secondary')}
                    >
                        Lihat berita
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}

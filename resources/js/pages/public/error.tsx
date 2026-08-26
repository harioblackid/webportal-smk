import { Link } from '@inertiajs/react';

import { buttonClasses } from '@/components/public/button';
import HeroText from '@/components/public/hero-text';
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

/** AstroWind's 404 page — a big status code over the two ways back. */
export default function ErrorPage({ status, seo }: ErrorProps) {
    const message = messages[status] ?? {
        title: 'Terjadi kesalahan',
        body: 'Silakan coba beberapa saat lagi.',
    };

    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline={
                    <span className="text-9xl font-bold text-aw-primary/25">
                        {status}
                    </span>
                }
                title={message.title}
                subtitle={message.body}
                actions={
                    <>
                        <div className="flex w-full sm:w-auto">
                            <Link
                                href={home()}
                                className={buttonClasses(
                                    'primary',
                                    'w-full sm:mb-0',
                                )}
                            >
                                Kembali ke beranda
                            </Link>
                        </div>

                        <div className="flex w-full sm:w-auto">
                            <Link
                                href={postsIndex()}
                                className={buttonClasses(
                                    'secondary',
                                    'w-full sm:mb-0',
                                )}
                            >
                                Lihat berita
                            </Link>
                        </div>
                    </>
                }
            />
        </PublicLayout>
    );
}

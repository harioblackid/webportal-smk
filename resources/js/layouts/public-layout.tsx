import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import Footer from '@/components/public/footer';
import Header from '@/components/public/header';
import JsonLd from '@/components/public/json-ld';
import SeoHead from '@/components/public/seo-head';
import type { Seo } from '@/types';

type PublicLayoutProps = {
    seo: Seo;
    children: ReactNode;
};

/**
 * AstroWind's PageLayout: metadata, the landmark structure, and the shared
 * header/footer.
 *
 * `font-aw` and the page colours are set here rather than on <body>, so the
 * admin area keeps the starter kit's own typeface and shadcn tokens.
 */
export default function PublicLayout({ seo, children }: PublicLayoutProps) {
    const site = usePage().props.site;

    return (
        <div className="flex min-h-screen flex-col bg-page font-aw text-aw-default antialiased">
            <SeoHead seo={seo} />

            {/* The organisation node rides along on every public page. */}
            <JsonLd data={site.organization} />

            <a href="#konten" className="skip-link">
                Lewati ke konten utama
            </a>

            <Header />

            <main id="konten" className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
}

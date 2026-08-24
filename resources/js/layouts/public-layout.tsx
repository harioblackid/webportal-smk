import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import Footer from '@/components/public/footer';
import JsonLd from '@/components/public/json-ld';
import Navbar from '@/components/public/navbar';
import SeoHead from '@/components/public/seo-head';
import type { Seo } from '@/types';

type PublicLayoutProps = {
    seo: Seo;
    children: ReactNode;
};

/**
 * The shell every public page renders inside: metadata, the landmark
 * structure AD-2 asks for, and the shared navbar/footer.
 */
export default function PublicLayout({ seo, children }: PublicLayoutProps) {
    const site = usePage().props.site;

    return (
        <>
            <SeoHead seo={seo} />

            {/* FR6-11: the organisation node rides along on every public page. */}
            <JsonLd data={site.organization} />

            <a href="#konten" className="skip-link">
                Lewati ke konten utama
            </a>

            <Navbar />

            <main id="konten">{children}</main>

            <Footer />
        </>
    );
}

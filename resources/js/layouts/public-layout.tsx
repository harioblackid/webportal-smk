import type { ReactNode } from 'react';

import Footer from '@/components/public/footer';
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
    return (
        <>
            <SeoHead seo={seo} />

            <a href="#konten" className="skip-link">
                Lewati ke konten utama
            </a>

            <Navbar />

            <main id="konten">{children}</main>

            <Footer />
        </>
    );
}

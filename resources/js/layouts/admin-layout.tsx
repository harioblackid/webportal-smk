import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import FlashToast from '@/components/admin/flash-toast';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminLayoutProps = {
    title: string;
    /** Page-level buttons (Tulis berita, Simpan, …), right of the heading. */
    actions?: ReactNode;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
};

/**
 * The CMS shell: the Laravel starter kit's collapsible sidebar layout, plus the
 * page heading and the redirect-carried toast every admin screen needs.
 */
export default function AdminLayout({
    title,
    actions,
    description,
    breadcrumbs,
    children,
}: AdminLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs ?? [{ title, href: '#' }]}>
            <Head title={title}>
                {/* Belt and braces alongside the X-Robots-Tag header (FR5-5). */}
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        title={title}
                        description={description}
                        className="mb-0"
                    />

                    {actions ? (
                        <div className="flex flex-wrap gap-2">{actions}</div>
                    ) : null}
                </div>

                <FlashToast />

                {children}
            </div>
        </AppLayout>
    );
}

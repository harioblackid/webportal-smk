import { FileText, PencilLine } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

type DashboardProps = {
    stats: {
        published: number;
        draft: number;
    };
};

export default function Dashboard({ stats }: DashboardProps) {
    const cards = [
        { label: 'Berita terbit', value: stats.published, icon: FileText },
        { label: 'Draf', value: stats.draft, icon: PencilLine },
    ];

    return (
        <AdminLayout title="Dasbor">
            <dl className="grid gap-4 sm:grid-cols-2">
                {cards.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="rounded-xl border border-charcoal/15 p-5"
                    >
                        <dt className="flex items-center gap-2 text-sm font-medium text-charcoal">
                            <Icon className="size-4" aria-hidden="true" />
                            {label}
                        </dt>
                        <dd className="mt-2 font-display text-3xl font-semibold text-onyx">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>

            <p className="mt-6 text-sm text-charcoal">
                Ringkasan lengkap dan tautan cepat menyusul bersama modul Berita
                (FR5-6).
            </p>
        </AdminLayout>
    );
}

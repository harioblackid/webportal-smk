import { Link } from '@inertiajs/react';
import {
    FileText,
    GraduationCap,
    Images,
    LayoutTemplate,
    PencilLine,
    Plus,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { buttonClasses } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { create as createHero } from '@/routes/admin/heroes';
import { index as mediaIndex } from '@/routes/admin/media';
import { create as createPost } from '@/routes/admin/posts';
import type { PostStatus } from '@/types';

type DashboardProps = {
    stats: {
        published: number;
        draft: number;
        majors: number;
        media: number;
    };
    recentPosts: {
        id: number;
        title: string;
        status: PostStatus;
        publishedAtLabel: string | null;
        editUrl: string;
    }[];
};

type StatCard = {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
};

/** FR5-6 — counts, the newest berita, and the two actions staff reach for. */
export default function Dashboard({ stats, recentPosts }: DashboardProps) {
    const cards: StatCard[] = [
        { label: 'Berita terbit', value: stats.published, icon: FileText },
        { label: 'Draf', value: stats.draft, icon: PencilLine },
        { label: 'Jurusan aktif', value: stats.majors, icon: GraduationCap },
        { label: 'Gambar', value: stats.media, icon: Images },
    ];

    return (
        <AdminLayout
            title="Dasbor"
            actions={
                <Link href={createPost()} className={buttonClasses()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tulis berita
                </Link>
            }
        >
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <section className="mt-8">
                <h2 className="font-display text-lg font-semibold text-onyx">
                    Berita terbaru
                </h2>

                {recentPosts.length === 0 ? (
                    <p className="mt-3 text-sm text-charcoal">
                        Belum ada berita. Mulai dari tombol “Tulis berita”.
                    </p>
                ) : (
                    <ul className="mt-3 divide-y divide-charcoal/10 rounded-xl border border-charcoal/15">
                        {recentPosts.map((post) => (
                            <li key={post.id}>
                                <Link
                                    href={post.editUrl}
                                    className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-mist/60"
                                >
                                    <span className="flex-1 font-medium text-onyx">
                                        {post.title}
                                    </span>

                                    <span
                                        className={
                                            post.status === 'published'
                                                ? 'rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand'
                                                : 'rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-charcoal'
                                        }
                                    >
                                        {post.status === 'published'
                                            ? 'Terbit'
                                            : 'Draf'}
                                    </span>

                                    <span className="text-sm text-charcoal">
                                        {post.publishedAtLabel ?? '—'}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="mt-8">
                <h2 className="font-display text-lg font-semibold text-onyx">
                    Aksi cepat
                </h2>

                <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                        href={createPost()}
                        className={buttonClasses('secondary')}
                    >
                        <PencilLine className="size-4" aria-hidden="true" />
                        Tulis berita
                    </Link>

                    <Link
                        href={createHero()}
                        className={buttonClasses('secondary')}
                    >
                        <LayoutTemplate className="size-4" aria-hidden="true" />
                        Atur hero
                    </Link>

                    <Link
                        href={mediaIndex()}
                        className={buttonClasses('secondary')}
                    >
                        <Images className="size-4" aria-hidden="true" />
                        Pustaka media
                    </Link>
                </div>
            </section>
        </AdminLayout>
    );
}

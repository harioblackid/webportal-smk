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

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
                <Link href={createPost()} className={buttonVariants()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tulis berita
                </Link>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Icon className="size-4" aria-hidden="true" />
                                {label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Berita terbaru</CardTitle>
                </CardHeader>

                <CardContent>
                    {recentPosts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Belum ada berita. Mulai dari tombol “Tulis berita”.
                        </p>
                    ) : (
                        <ul className="divide-y divide-border rounded-md border">
                            {recentPosts.map((post) => (
                                <li key={post.id}>
                                    <Link
                                        href={post.editUrl}
                                        className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-muted/60"
                                    >
                                        <span className="flex-1 font-medium">
                                            {post.title}
                                        </span>

                                        <Badge
                                            variant={
                                                post.status === 'published'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {post.status === 'published'
                                                ? 'Terbit'
                                                : 'Draf'}
                                        </Badge>

                                        <span className="text-sm text-muted-foreground">
                                            {post.publishedAtLabel ?? '—'}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <section>
                <h2 className="mb-3 text-lg font-semibold">Aksi cepat</h2>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href={createPost()}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        <PencilLine className="size-4" aria-hidden="true" />
                        Tulis berita
                    </Link>

                    <Link
                        href={createHero()}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        <LayoutTemplate className="size-4" aria-hidden="true" />
                        Atur hero
                    </Link>

                    <Link
                        href={mediaIndex()}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        <Images className="size-4" aria-hidden="true" />
                        Pustaka media
                    </Link>
                </div>
            </section>
        </AdminLayout>
    );
}

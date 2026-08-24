import { Link } from '@inertiajs/react';
import { Newspaper } from 'lucide-react';

import NewsCard from '@/components/public/news-card';
import Pagination from '@/components/public/pagination';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { index as postsIndex } from '@/routes/posts';
import type {
    CategoryLink,
    NewsCard as NewsCardData,
    Paginated,
    Seo,
} from '@/types';

type BeritaIndexProps = {
    posts: Paginated<NewsCardData>;
    categories: CategoryLink[];
    activeCategory: { name: string; slug: string } | null;
    seo: Seo;
};

export default function BeritaIndex({
    posts,
    categories,
    activeCategory,
    seo,
}: BeritaIndexProps) {
    const heading =
        activeCategory === null ? 'Berita & Pengumuman' : activeCategory.name;

    return (
        <PublicLayout seo={seo}>
            <header className="border-b border-charcoal/10 bg-mist">
                <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
                    <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
                        <span
                            className="h-px w-8 bg-brand-accent"
                            aria-hidden="true"
                        />
                        Kabar Sekolah
                    </p>

                    <h1 className="mt-4 max-w-2xl font-display text-[30px] leading-tight font-semibold text-onyx sm:text-4xl lg:text-5xl">
                        {heading}
                    </h1>

                    <p className="mt-4 max-w-xl text-base text-charcoal">
                        Kegiatan, prestasi, dan pengumuman resmi dari SMK PGRI
                        Telagasari.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
                {categories.length > 0 && (
                    <nav aria-label="Filter kategori" className="mb-8">
                        <ul className="flex flex-wrap gap-2">
                            <li>
                                <Link
                                    href={postsIndex()}
                                    aria-current={
                                        activeCategory === null
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors',
                                        activeCategory === null
                                            ? 'bg-brand text-white'
                                            : 'bg-mist text-charcoal hover:text-onyx',
                                    )}
                                >
                                    Semua
                                </Link>
                            </li>

                            {categories.map((category) => (
                                <li key={category.slug}>
                                    <Link
                                        href={category.url}
                                        aria-current={
                                            activeCategory?.slug ===
                                            category.slug
                                                ? 'page'
                                                : undefined
                                        }
                                        className={cn(
                                            'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors',
                                            activeCategory?.slug ===
                                                category.slug
                                                ? 'bg-brand text-white'
                                                : 'bg-mist text-charcoal hover:text-onyx',
                                        )}
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {posts.data.length === 0 ? (
                    /* FR4-9: an empty state that explains itself, not a blank page. */
                    <div className="rounded-xl border border-dashed border-charcoal/25 px-6 py-14 text-center">
                        <Newspaper
                            className="mx-auto size-8 text-brand/40"
                            aria-hidden="true"
                        />

                        <p className="mt-4 font-display text-xl font-semibold text-onyx">
                            Belum ada berita di sini
                        </p>

                        <p className="mt-2 text-[15px] text-charcoal">
                            {activeCategory === null
                                ? 'Kabar terbaru akan tampil begitu diterbitkan.'
                                : 'Kategori ini belum memiliki berita terbit.'}
                        </p>

                        {activeCategory !== null && (
                            <Link
                                href={postsIndex()}
                                className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:text-brand-accent"
                            >
                                Lihat semua berita
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post, index) => (
                            <NewsCard
                                key={post.id}
                                post={post}
                                eager={index < 3}
                            />
                        ))}
                    </div>
                )}

                <Pagination links={posts.links} lastPage={posts.last_page} />
            </div>
        </PublicLayout>
    );
}

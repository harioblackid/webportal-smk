import { Link } from '@inertiajs/react';
import { Newspaper } from 'lucide-react';

import { buttonClasses } from '@/components/public/button';
import HeroText from '@/components/public/hero-text';
import NewsCard from '@/components/public/news-card';
import Pagination from '@/components/public/pagination';
import WidgetWrapper from '@/components/public/widget-wrapper';
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
            <HeroText
                tagline="Kabar Sekolah"
                title={heading}
                subtitle="Kegiatan, prestasi, dan pengumuman resmi dari SMK PGRI Telagasari."
            />

            <WidgetWrapper containerClass="mx-auto max-w-6xl pt-0 md:pt-0 lg:pt-0">
                {categories.length > 0 && (
                    <nav aria-label="Filter kategori" className="mb-10">
                        <ul className="flex flex-wrap justify-center gap-2 text-sm">
                            <li>
                                <Link
                                    href={postsIndex()}
                                    aria-current={
                                        activeCategory === null
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'inline-block px-3 py-1 font-medium lowercase transition',
                                        activeCategory === null
                                            ? 'bg-aw-primary text-white'
                                            : 'bg-gray-100 text-aw-muted hover:text-aw-primary dark:bg-slate-700 dark:text-slate-300',
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
                                            'inline-block px-3 py-1 font-medium lowercase transition',
                                            activeCategory?.slug ===
                                                category.slug
                                                ? 'bg-aw-primary text-white'
                                                : 'bg-gray-100 text-aw-muted hover:text-aw-primary dark:bg-slate-700 dark:text-slate-300',
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
                    /* An empty state that explains itself, not a blank page. */
                    <div className="mx-auto max-w-xl rounded-md border border-dashed border-gray-300 px-6 py-14 text-center dark:border-gray-700">
                        <Newspaper
                            className="mx-auto size-8 text-aw-muted"
                            aria-hidden="true"
                        />

                        <p className="mt-4 font-heading text-xl font-bold">
                            Belum ada berita di sini
                        </p>

                        <p className="mt-2 text-aw-muted">
                            {activeCategory === null
                                ? 'Kabar terbaru akan tampil begitu diterbitkan.'
                                : 'Kategori ini belum memiliki berita terbit.'}
                        </p>

                        {activeCategory !== null && (
                            <Link
                                href={postsIndex()}
                                className={buttonClasses('tertiary', 'mt-5')}
                            >
                                Lihat semua berita
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="-mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            </WidgetWrapper>
        </PublicLayout>
    );
}

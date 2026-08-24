import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import NewsCard from '@/components/public/news-card';
import SiteImage from '@/components/public/site-image';
import PublicLayout from '@/layouts/public-layout';
import { index as postsIndex } from '@/routes/posts';
import type { NewsCard as NewsCardData, PostDetail, Seo } from '@/types';

type BeritaShowProps = {
    post: PostDetail;
    related: NewsCardData[];
    seo: Seo;
};

export default function BeritaShow({ post, related, seo }: BeritaShowProps) {
    return (
        <PublicLayout seo={seo}>
            <article>
                {/* prd-03 section 4: narrow measure for the text, wide lead image. */}
                <header className="mx-auto max-w-3xl px-5 pt-10 sm:px-6 lg:pt-14">
                    <Link
                        href={postsIndex()}
                        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-accent"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Semua berita
                    </Link>

                    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-charcoal">
                        {post.category !== null && (
                            <Link
                                href={post.category.url}
                                className="rounded-full bg-brand/10 px-3 py-1 text-brand hover:bg-brand hover:text-white"
                            >
                                {post.category.name}
                            </Link>
                        )}

                        {post.publishedAt !== null && (
                            <time dateTime={post.publishedAt}>
                                {post.publishedAtLabel}
                            </time>
                        )}
                    </p>

                    <h1 className="mt-4 font-display text-[30px] leading-[1.15] font-semibold text-balance text-onyx sm:text-4xl lg:text-5xl">
                        {post.title}
                    </h1>

                    {post.excerpt !== null && (
                        <p className="mt-4 text-lg text-charcoal">
                            {post.excerpt}
                        </p>
                    )}
                </header>

                {post.image !== null && (
                    <div className="mx-auto mt-8 max-w-5xl px-5 sm:px-6">
                        <SiteImage
                            image={post.image}
                            ratio="aspect-[16/9]"
                            className="rounded-2xl"
                            eager
                        />
                    </div>
                )}

                <div
                    className="rich-text mx-auto mt-8 max-w-3xl px-5 sm:px-6"
                    /* Rich text authored in the CMS; sanitising on write is US-011. */
                    dangerouslySetInnerHTML={{ __html: post.body }}
                />
            </article>

            {related.length > 0 && (
                <section
                    aria-labelledby="terkait"
                    className="mx-auto mt-14 max-w-6xl border-t border-charcoal/10 px-5 pt-12 sm:px-6"
                >
                    <h2
                        id="terkait"
                        className="font-display text-2xl font-semibold text-onyx sm:text-3xl"
                    >
                        Berita lainnya
                    </h2>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((item) => (
                            <NewsCard key={item.id} post={item} />
                        ))}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

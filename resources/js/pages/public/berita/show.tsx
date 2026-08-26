import { Link } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';

import { buttonClasses } from '@/components/public/button';
import JsonLd from '@/components/public/json-ld';
import NewsCard from '@/components/public/news-card';
import SiteImage from '@/components/public/site-image';
import PublicLayout from '@/layouts/public-layout';
import { index as postsIndex } from '@/routes/posts';
import type { NewsCard as NewsCardData, PostDetail, Seo } from '@/types';

type BeritaShowProps = {
    post: PostDetail;
    related: NewsCardData[];
    /** schema.org NewsArticle built server-side. */
    jsonLd: Record<string, unknown>;
    seo: Seo;
};

/** AstroWind's blog/SinglePost — wide lead image, narrow prose column. */
export default function BeritaShow({
    post,
    related,
    jsonLd,
    seo,
}: BeritaShowProps) {
    return (
        <PublicLayout seo={seo}>
            <JsonLd data={jsonLd} />

            <section className="mx-auto py-8 sm:py-16 lg:py-20">
                <article>
                    <header>
                        <div className="mx-auto mt-0 mb-2 flex max-w-3xl flex-col justify-between px-4 sm:flex-row sm:items-center sm:px-6">
                            <p className="flex flex-wrap items-center gap-x-2 text-aw-muted">
                                {post.publishedAt !== null && (
                                    <span className="inline-flex items-center gap-1">
                                        <Clock
                                            className="-mt-0.5 inline-block size-4"
                                            aria-hidden="true"
                                        />
                                        <time dateTime={post.publishedAt}>
                                            {post.publishedAtLabel}
                                        </time>
                                    </span>
                                )}

                                {post.category !== null && (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <Link
                                            className="inline-block hover:underline"
                                            href={post.category.url}
                                        >
                                            {post.category.name}
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>

                        <h1 className="mx-auto max-w-3xl px-4 font-heading text-4xl leading-tight font-bold tracking-tighter text-balance sm:px-6 md:text-5xl">
                            {post.title}
                        </h1>

                        {post.excerpt !== null && (
                            <p className="mx-auto mt-4 mb-8 max-w-3xl px-4 text-xl text-aw-muted sm:px-6 md:text-2xl dark:text-slate-400">
                                {post.excerpt}
                            </p>
                        )}

                        {post.image !== null ? (
                            <SiteImage
                                image={post.image}
                                ratio="aspect-[16/9]"
                                className="mx-auto mb-6 max-w-full sm:rounded-md lg:max-w-[900px]"
                                eager
                            />
                        ) : (
                            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                                <div className="border-t dark:border-slate-700" />
                            </div>
                        )}
                    </header>

                    <div
                        className="mx-auto prose prose-base mt-8 max-w-3xl px-6 lg:prose-xl dark:prose-invert prose-headings:scroll-mt-[80px] prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tighter dark:prose-headings:text-slate-300 prose-a:text-aw-primary dark:prose-a:text-blue-400 prose-li:my-0 prose-img:rounded-md prose-img:shadow-lg"
                        /* Rich text authored in the CMS; sanitised on write. */
                        dangerouslySetInnerHTML={{ __html: post.body }}
                    />

                    <div className="mx-auto mt-8 max-w-3xl px-6">
                        <Link
                            href={postsIndex()}
                            className={buttonClasses(
                                'tertiary',
                                'px-3 md:px-3',
                            )}
                        >
                            <ArrowLeft
                                className="mr-2 size-5"
                                aria-hidden="true"
                            />
                            Semua berita
                        </Link>
                    </div>
                </article>
            </section>

            {related.length > 0 && (
                <section
                    aria-labelledby="terkait"
                    className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 md:pb-16 lg:pb-20"
                >
                    <h2
                        id="terkait"
                        className="mb-8 font-heading text-2xl font-bold tracking-tighter sm:text-3xl"
                    >
                        Berita lainnya
                    </h2>

                    <div className="-mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {related.map((item) => (
                            <NewsCard key={item.id} post={item} />
                        ))}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

import { Link } from '@inertiajs/react';
import { Clock } from 'lucide-react';

import SiteImage from '@/components/public/site-image';
import { cn } from '@/lib/utils';
import type { NewsCard as NewsCardData } from '@/types';

type NewsCardProps = {
    post: NewsCardData;
    className?: string;
    /** The first row of a grid is usually above the fold. */
    eager?: boolean;
};

/**
 * AstroWind's blog/GridItem.
 *
 * The whole card is clickable through a stretched link on the title, so the
 * accessible name stays the headline rather than "read more".
 */
export default function NewsCard({
    post,
    className,
    eager = false,
}: NewsCardProps) {
    return (
        <article className={cn('group relative mb-6 transition', className)}>
            <SiteImage
                image={post.image}
                ratio="aspect-[16/9] md:h-64 md:aspect-auto"
                className="mb-6 rounded shadow-lg"
                eager={eager}
                thumb
            />

            <h3 className="mb-2 font-heading text-xl leading-tight font-bold sm:text-2xl dark:text-slate-300">
                <Link
                    href={post.url}
                    className="inline-block transition duration-200 ease-in after:absolute after:inset-0 hover:text-aw-primary dark:hover:text-blue-700"
                >
                    {post.title}
                </Link>
            </h3>

            <p className="mb-2 flex flex-wrap items-center gap-x-2 text-sm text-aw-muted">
                {post.publishedAt !== null && (
                    <span className="inline-flex items-center gap-1">
                        <Clock className="size-4" aria-hidden="true" />
                        <time dateTime={post.publishedAt}>
                            {post.publishedAtLabel}
                        </time>
                    </span>
                )}

                {post.category !== null && (
                    <span className="inline-block bg-gray-100 px-2 py-0.5 font-medium lowercase dark:bg-slate-700">
                        {post.category.name}
                    </span>
                )}
            </p>

            {post.excerpt !== null && (
                <p className="line-clamp-3 text-lg text-aw-muted dark:text-slate-400">
                    {post.excerpt}
                </p>
            )}
        </article>
    );
}

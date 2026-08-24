import { Link } from '@inertiajs/react';

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
 * FR4-8 — thumbnail, category, date, title, excerpt.
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
        <article
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl border border-charcoal/12 bg-white transition-shadow hover:shadow-lg hover:shadow-onyx/5',
                className,
            )}
        >
            <SiteImage image={post.image} eager={eager} thumb />

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-charcoal">
                    {post.category !== null && (
                        <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-brand">
                            {post.category.name}
                        </span>
                    )}

                    {post.publishedAt !== null && (
                        <time dateTime={post.publishedAt}>
                            {post.publishedAtLabel}
                        </time>
                    )}
                </p>

                <h3 className="mt-2 font-display text-lg leading-snug font-semibold text-onyx sm:text-xl">
                    <Link
                        href={post.url}
                        className="group-hover:text-brand after:absolute after:inset-0"
                    >
                        {post.title}
                    </Link>
                </h3>

                {post.excerpt !== null && (
                    <p className="mt-2 line-clamp-3 text-[15px] text-charcoal">
                        {post.excerpt}
                    </p>
                )}
            </div>
        </article>
    );
}

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { Image } from '@/types';

type HeroProps = {
    tagline?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    /** Full-bleed background. Null falls back to the flat page surface. */
    image?: Image | null;
    /** The first slide is the LCP candidate and must not be lazy. */
    eager?: boolean;
    /**
     * Heading level for the title. Only the first slide of a carousel may be
     * the page's `h1` — three of them on one page is three page titles, which
     * is an SEO and screen-reader fault, not a styling detail. Later slides
     * render an `h2` that looks identical.
     */
    as?: 'h1' | 'h2';
    id?: string;
};

/**
 * AstroWind's widgets/Hero, reworked into a transparent full-bleed band: the
 * image is the background and the copy sits on top of it, rather than under it.
 *
 * The negative top margin pulls the section under the sticky header, so the
 * header floats over the photo — that is what makes the band read as
 * transparent rather than as a picture with a bar above it.
 *
 * The height is fixed rather than intrinsic. The media table stores no image
 * dimensions, and a hero that resizes once the photo decodes is a CLS failure
 * on the one screen the Core Web Vitals budget cares most about.
 */
export default function Hero({
    tagline,
    title,
    subtitle,
    actions,
    image,
    eager = false,
    as: Heading = 'h1',
    id,
}: HeroProps) {
    return (
        <section
            id={id}
            className="relative flex min-h-125 items-center overflow-hidden md:-mt-[76px] md:min-h-160"
        >
            <div className="absolute inset-0 -z-10" aria-hidden="true">
                {image === null || image === undefined ? (
                    <div className="size-full bg-gray-100 dark:bg-slate-800" />
                ) : (
                    <img
                        src={image.url}
                        alt=""
                        loading={eager ? 'eager' : 'lazy'}
                        fetchPriority={eager ? 'high' : 'auto'}
                        decoding={eager ? 'sync' : 'async'}
                        className="size-full object-cover"
                    />
                )}

                {/* Dark enough to keep the copy at AA on any photo the school
                    uploads, since we cannot know what is behind the text. */}
                <div
                    className={cn(
                        'absolute inset-0',
                        image === null || image === undefined
                            ? 'bg-transparent'
                            : 'bg-gradient-to-b from-black/70 via-black/55 to-black/70',
                    )}
                />
            </div>

            <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div className="pointer-events-none pt-0 md:pt-[76px]" />

                <div className="py-16 md:py-24">
                    <div
                        className={cn(
                            'mx-auto max-w-4xl text-center',
                            image === null || image === undefined
                                ? 'text-aw-default'
                                : 'text-white',
                        )}
                    >
                        {tagline && (
                            <p
                                className={cn(
                                    'text-base font-bold tracking-wide uppercase',
                                    image === null || image === undefined
                                        ? 'text-aw-secondary dark:text-blue-200'
                                        : 'text-white/80',
                                )}
                            >
                                {tagline}
                            </p>
                        )}

                        <Heading className="mb-4 font-heading text-4xl leading-tight font-bold tracking-tighter text-balance drop-shadow-sm sm:text-5xl md:text-6xl">
                            {title}
                        </Heading>

                        <div className="mx-auto max-w-3xl">
                            {subtitle && (
                                <p
                                    className={cn(
                                        'mb-8 text-lg md:text-xl',
                                        image === null || image === undefined
                                            ? 'text-aw-muted dark:text-slate-300'
                                            : 'text-white/90',
                                    )}
                                >
                                    {subtitle}
                                </p>
                            )}

                            {actions && (
                                <div className="m-auto flex max-w-xs flex-col flex-nowrap gap-4 sm:max-w-2xl sm:flex-row sm:justify-center">
                                    {actions}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

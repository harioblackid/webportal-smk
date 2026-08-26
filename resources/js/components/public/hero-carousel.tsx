import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { buttonClasses } from '@/components/public/button';
import Hero from '@/components/public/hero';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/types';

type HeroCarouselProps = {
    slides: HeroSlide[];
    tagline: string;
};

/** Long enough to read a headline, short enough that slide 3 is ever seen. */
const INTERVAL = 6000;

/**
 * The front-page hero carousel.
 *
 * Hand-rolled rather than pulled from a library: this needs one axis, dots,
 * arrows, and a timer, and the smallest carousel package is heavier than the
 * whole thing. Slides are laid out in a scroll-snap track, so a touch swipe is
 * the browser's own gesture and needs no drag handling from us.
 *
 * Autoplay stops on hover, on keyboard focus, and whenever the visitor asks
 * for reduced motion — the last one being the difference between a nice
 * flourish and something people cannot read.
 */
export default function HeroCarousel({ slides, tagline }: HeroCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const many = slides.length > 1;

    useEffect(() => {
        if (!many || paused) {
            return;
        }

        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reduced) {
            return;
        }

        const timer = window.setInterval(() => {
            setCurrent((index) => (index + 1) % slides.length);
        }, INTERVAL);

        return () => window.clearInterval(timer);
    }, [many, paused, slides.length]);

    // The track is the source of truth for what is on screen; this only tells
    // it where to go. Scrolling the container rather than transforming it keeps
    // the native swipe and the dots in agreement.
    useEffect(() => {
        const track = trackRef.current;

        if (track === null) {
            return;
        }

        track.scrollTo({
            left: track.clientWidth * current,
            behavior: 'smooth',
        });
    }, [current]);

    function go(by: number) {
        setCurrent((index) => (index + by + slides.length) % slides.length);
    }

    const slide = (item: HeroSlide, index: number) => (
        <Hero
            tagline={tagline}
            title={item.title}
            subtitle={item.subtitle ?? undefined}
            image={item.image}
            eager={index === 0}
            // Exactly one h1 per page, no matter how many slides are active.
            as={index === 0 ? 'h1' : 'h2'}
            actions={
                <>
                    {item.postUrl === null ? null : (
                        <div className="flex w-full sm:w-auto">
                            <Link
                                href={item.postUrl}
                                className={buttonClasses(
                                    'primary',
                                    'w-full sm:mb-0',
                                )}
                            >
                                {item.postLinkText}
                            </Link>
                        </div>
                    )}

                    {item.ctas.map((cta, position) => (
                        <div key={cta.url} className="flex w-full sm:w-auto">
                            <a
                                href={cta.url}
                                className={buttonClasses(
                                    item.postUrl === null && position === 0
                                        ? 'primary'
                                        : 'secondary',
                                    'w-full sm:mb-0',
                                )}
                            >
                                {cta.text}
                            </a>
                        </div>
                    ))}
                </>
            }
        />
    );

    if (!many) {
        return slide(slides[0], 0);
    }

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Sorotan halaman depan"
            className="relative md:-mt-[76px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <div
                ref={trackRef}
                className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
            >
                {slides.map((item, index) => (
                    <div
                        key={item.id}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} dari ${slides.length}`}
                        aria-hidden={index !== current}
                        className="w-full shrink-0 snap-start md:mt-[76px]"
                    >
                        {slide(item, index)}
                    </div>
                ))}
            </div>

            <button
                type="button"
                aria-label="Sorotan sebelumnya"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 md:flex"
            >
                <ChevronLeft className="size-6" aria-hidden="true" />
            </button>

            <button
                type="button"
                aria-label="Sorotan berikutnya"
                onClick={() => go(1)}
                className="absolute top-1/2 right-2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 md:flex"
            >
                <ChevronRight className="size-6" aria-hidden="true" />
            </button>

            <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
                {slides.map((item, index) => (
                    <button
                        key={item.id}
                        type="button"
                        aria-label={`Tampilkan sorotan ${index + 1}`}
                        aria-current={index === current}
                        onClick={() => setCurrent(index)}
                        className={cn(
                            'size-3 rounded-full border border-white/70 transition',
                            index === current ? 'bg-white' : 'bg-white/30',
                        )}
                    />
                ))}
            </div>
        </section>
    );
}

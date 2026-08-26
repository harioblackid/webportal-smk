import type { ReactNode } from 'react';

type HeroProps = {
    tagline?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    image?: ReactNode;
    id?: string;
};

/**
 * AstroWind's widgets/Hero — centred copy over a full-bleed band, with the
 * image sitting under it rather than beside it.
 *
 * The negative top margin pulls the section under the sticky header, which is
 * what gives the template its edge-to-edge first screen.
 */
export default function Hero({
    tagline,
    title,
    subtitle,
    actions,
    image,
    id,
}: HeroProps) {
    return (
        <section id={id} className="relative md:-mt-[76px]">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <div className="pointer-events-none pt-0 md:pt-[76px]" />

                <div className="py-12 md:py-20">
                    <div className="mx-auto max-w-5xl pb-10 text-center md:pb-16">
                        {tagline && (
                            <p className="text-base font-bold tracking-wide text-aw-secondary uppercase dark:text-blue-200">
                                {tagline}
                            </p>
                        )}

                        <h1 className="mb-4 font-heading text-5xl leading-tight font-bold tracking-tighter text-balance md:text-6xl dark:text-gray-200">
                            {title}
                        </h1>

                        <div className="mx-auto max-w-3xl">
                            {subtitle && (
                                <p className="mb-6 text-xl text-aw-muted dark:text-slate-300">
                                    {subtitle}
                                </p>
                            )}

                            {actions && (
                                <div className="m-auto flex max-w-xs flex-col flex-nowrap gap-4 sm:max-w-md sm:flex-row sm:justify-center">
                                    {actions}
                                </div>
                            )}
                        </div>
                    </div>

                    {image && (
                        <div className="relative m-auto max-w-5xl">{image}</div>
                    )}
                </div>
            </div>
        </section>
    );
}

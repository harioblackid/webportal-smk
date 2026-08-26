import type { ReactNode } from 'react';

type HeroTextProps = {
    tagline?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    id?: string;
};

/**
 * AstroWind's widgets/HeroText — the copy-only page opener used by every
 * interior page, sitting under the sticky header rather than beside an image.
 */
export default function HeroText({
    tagline,
    title,
    subtitle,
    actions,
    id,
}: HeroTextProps) {
    return (
        <section id={id} className="relative md:-mt-[76px]">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <div className="pointer-events-none pt-0 md:pt-[76px]" />

                <div className="py-12 pb-8 md:py-20 md:pb-8">
                    <div className="mx-auto max-w-5xl text-center">
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
                </div>
            </div>
        </section>
    );
}

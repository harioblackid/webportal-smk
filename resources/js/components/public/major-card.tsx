import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import SiteImage from '@/components/public/site-image';
import { cn } from '@/lib/utils';
import type { MajorCard as MajorCardData } from '@/types';

type MajorCardProps = {
    major: MajorCardData;
    className?: string;
    eager?: boolean;
};

/** One program keahlian in the /jurusan grid, on AstroWind's GridItem frame. */
export default function MajorCard({
    major,
    className,
    eager = false,
}: MajorCardProps) {
    return (
        <article className={cn('group relative mb-6 transition', className)}>
            <SiteImage
                image={major.image}
                ratio="aspect-[4/3]"
                className="mb-6 rounded shadow-lg"
                eager={eager}
                thumb
            />

            <h3 className="mb-2 font-heading text-xl leading-tight font-bold sm:text-2xl dark:text-slate-300">
                <Link
                    href={major.url}
                    className="inline-block transition duration-200 ease-in after:absolute after:inset-0 hover:text-aw-primary dark:hover:text-blue-700"
                >
                    {major.name}
                </Link>
            </h3>

            {major.excerpt !== null && (
                <p className="line-clamp-3 text-lg text-aw-muted dark:text-slate-400">
                    {major.excerpt}
                </p>
            )}

            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-aw-primary">
                Pelajari jurusan
                <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                />
            </p>
        </article>
    );
}

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

/** FR4-16 — one program keahlian in the /jurusan grid. */
export default function MajorCard({
    major,
    className,
    eager = false,
}: MajorCardProps) {
    return (
        <article
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl border border-charcoal/12 bg-white transition-shadow hover:shadow-lg hover:shadow-onyx/5',
                className,
            )}
        >
            <SiteImage
                image={major.image}
                ratio="aspect-[4/3]"
                eager={eager}
                thumb
            />

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="font-display text-lg leading-snug font-semibold text-onyx sm:text-xl">
                    <Link
                        href={major.url}
                        className="group-hover:text-brand after:absolute after:inset-0"
                    >
                        {major.name}
                    </Link>
                </h3>

                {major.excerpt !== null && (
                    <p className="mt-2 line-clamp-3 text-[15px] text-charcoal">
                        {major.excerpt}
                    </p>
                )}

                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    Pelajari jurusan
                    <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                </p>
            </div>
        </article>
    );
}

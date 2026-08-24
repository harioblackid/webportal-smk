import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import MajorCard from '@/components/public/major-card';
import PpdbBanner from '@/components/public/ppdb-banner';
import SiteImage from '@/components/public/site-image';
import PublicLayout from '@/layouts/public-layout';
import { index as majorsIndex } from '@/routes/majors';
import type { MajorCard as MajorCardData, MajorDetail, Seo } from '@/types';

type JurusanShowProps = {
    major: MajorDetail;
    others: MajorCardData[];
    seo: Seo;
};

export default function JurusanShow({ major, others, seo }: JurusanShowProps) {
    return (
        <PublicLayout seo={seo}>
            <header className="border-b border-charcoal/10 bg-mist">
                <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-12 lg:py-14">
                    <div className="lg:col-span-7">
                        <Link
                            href={majorsIndex()}
                            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-accent"
                        >
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Semua jurusan
                        </Link>

                        <h1 className="mt-3 font-display text-[30px] leading-[1.15] font-semibold text-balance text-onyx sm:text-4xl lg:text-5xl">
                            {major.name}
                        </h1>

                        {major.excerpt !== null && (
                            <p className="mt-4 max-w-xl text-lg text-charcoal">
                                {major.excerpt}
                            </p>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        <SiteImage
                            image={major.image}
                            ratio="aspect-[4/3]"
                            className="rounded-2xl shadow-lg shadow-onyx/10"
                            eager
                        />
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-12">
                    {major.description !== null && (
                        <div
                            className="rich-text lg:col-span-7"
                            dangerouslySetInnerHTML={{
                                __html: major.description,
                            }}
                        />
                    )}

                    {major.extra !== null && (
                        /* FR4-16a: the optional kompetensi/prospek block. */
                        <aside className="lg:col-span-5">
                            <div className="rounded-2xl bg-mist p-6">
                                <h2 className="font-display text-xl font-semibold text-onyx">
                                    Kompetensi & prospek
                                </h2>

                                <div
                                    className="rich-text mt-4"
                                    dangerouslySetInnerHTML={{
                                        __html: major.extra,
                                    }}
                                />
                            </div>
                        </aside>
                    )}
                </div>

                <div className="mt-12">
                    <PpdbBanner />
                </div>

                {others.length > 0 && (
                    <section
                        aria-labelledby="jurusan-lain"
                        className="mt-14 border-t border-charcoal/10 pt-12"
                    >
                        <h2
                            id="jurusan-lain"
                            className="font-display text-2xl font-semibold text-onyx sm:text-3xl"
                        >
                            Jurusan lainnya
                        </h2>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {others.map((item) => (
                                <MajorCard key={item.id} major={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </PublicLayout>
    );
}

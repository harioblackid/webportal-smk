import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { buttonClasses } from '@/components/public/button';
import Content from '@/components/public/content';
import HeroText from '@/components/public/hero-text';
import MajorCard from '@/components/public/major-card';
import PpdbBanner from '@/components/public/ppdb-banner';
import SiteImage from '@/components/public/site-image';
import WidgetWrapper from '@/components/public/widget-wrapper';
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
            <HeroText
                tagline="Program Keahlian"
                title={major.name}
                subtitle={major.excerpt ?? undefined}
            />

            <Content
                isAfterContent
                image={
                    <SiteImage
                        image={major.image}
                        ratio="aspect-[4/3]"
                        className="mx-auto w-full rounded-lg shadow-lg"
                        eager
                    />
                }
                content={
                    major.description === null ? undefined : (
                        <div
                            className="prose prose-base max-w-none lg:prose-lg dark:prose-invert prose-headings:font-heading prose-a:text-aw-primary"
                            dangerouslySetInnerHTML={{
                                __html: major.description,
                            }}
                        />
                    )
                }
            />

            {major.extra !== null && (
                <WidgetWrapper containerClass="mx-auto max-w-5xl pt-0 md:pt-0 lg:pt-0">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow sm:p-8 dark:border-gray-700 dark:bg-slate-900">
                        <h2 className="mb-4 font-heading text-2xl font-bold tracking-tighter">
                            Kompetensi & prospek
                        </h2>

                        <div
                            className="prose prose-base max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-aw-primary"
                            dangerouslySetInnerHTML={{ __html: major.extra }}
                        />
                    </div>
                </WidgetWrapper>
            )}

            <PpdbBanner />

            {others.length > 0 && (
                <WidgetWrapper containerClass="mx-auto max-w-6xl">
                    <h2 className="mb-8 font-heading text-2xl font-bold tracking-tighter sm:text-3xl">
                        Jurusan lainnya
                    </h2>

                    <div className="-mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {others.map((item) => (
                            <MajorCard key={item.id} major={item} />
                        ))}
                    </div>
                </WidgetWrapper>
            )}

            <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 md:pb-16">
                <Link
                    href={majorsIndex()}
                    className={buttonClasses('tertiary', 'px-3 md:px-3')}
                >
                    <ArrowLeft className="mr-2 size-5" aria-hidden="true" />
                    Semua jurusan
                </Link>
            </div>
        </PublicLayout>
    );
}

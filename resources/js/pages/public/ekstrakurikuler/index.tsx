import { CalendarDays, UserRound } from 'lucide-react';

import HeroText from '@/components/public/hero-text';
import SiteImage from '@/components/public/site-image';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import type { ExtracurricularCard, Seo } from '@/types';

type EkstrakurikulerIndexProps = {
    extracurriculars: ExtracurricularCard[];
    seo: Seo;
};

/** One list page, no detail route — an ekskul is a paragraph, not a programme. */
export default function EkstrakurikulerIndex({
    extracurriculars,
    seo,
}: EkstrakurikulerIndexProps) {
    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Kesiswaan"
                title="Ekstrakurikuler"
                subtitle="Kegiatan di luar jam pelajaran untuk mengasah minat, bakat, dan kepemimpinan peserta didik."
            />

            <WidgetWrapper containerClass="max-w-6xl">
                {extracurriculars.length === 0 ? (
                    <p className="rounded-md bg-gray-100 p-6 text-lg text-aw-muted dark:bg-slate-800">
                        Daftar ekstrakurikuler belum diisi.
                    </p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {extracurriculars.map((item, index) => (
                            <article
                                key={item.id}
                                id={item.slug}
                                className="flex scroll-mt-24 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-900"
                            >
                                <SiteImage
                                    image={item.image}
                                    ratio="aspect-[16/10]"
                                    className="w-full"
                                    eager={index < 3}
                                    thumb
                                />

                                <div className="flex flex-1 flex-col p-5">
                                    <h2 className="font-heading text-lg font-bold tracking-tight">
                                        {item.name}
                                    </h2>

                                    {item.description === null ? null : (
                                        <div
                                            className="prose prose-sm mt-3 max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{
                                                __html: item.description,
                                            }}
                                        />
                                    )}

                                    <dl className="mt-auto space-y-1 pt-4 text-sm text-aw-muted">
                                        {item.pembina === null ? null : (
                                            <div className="flex items-center gap-2">
                                                <dt className="sr-only">
                                                    Pembina
                                                </dt>
                                                <UserRound
                                                    className="size-4 shrink-0 text-aw-primary"
                                                    aria-hidden="true"
                                                />
                                                <dd>{item.pembina}</dd>
                                            </div>
                                        )}

                                        {item.jadwal === null ? null : (
                                            <div className="flex items-center gap-2">
                                                <dt className="sr-only">
                                                    Jadwal
                                                </dt>
                                                <CalendarDays
                                                    className="size-4 shrink-0 text-aw-primary"
                                                    aria-hidden="true"
                                                />
                                                <dd>{item.jadwal}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </WidgetWrapper>
        </PublicLayout>
    );
}

import { GraduationCap } from 'lucide-react';

import HeroText from '@/components/public/hero-text';
import MajorCard from '@/components/public/major-card';
import PpdbBanner from '@/components/public/ppdb-banner';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import type { MajorCard as MajorCardData, Seo } from '@/types';

type JurusanIndexProps = {
    majors: MajorCardData[];
    seo: Seo;
};

export default function JurusanIndex({ majors, seo }: JurusanIndexProps) {
    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Program Keahlian"
                title="Pilih jurusan yang sesuai denganmu"
                subtitle="Setiap program keahlian punya fokus kompetensi dan prospek yang berbeda. Bandingkan sebelum memutuskan."
            />

            <WidgetWrapper containerClass="mx-auto max-w-6xl pt-0 md:pt-0 lg:pt-0">
                {majors.length === 0 ? (
                    <div className="mx-auto max-w-xl rounded-md border border-dashed border-gray-300 px-6 py-14 text-center dark:border-gray-700">
                        <GraduationCap
                            className="mx-auto size-8 text-aw-muted"
                            aria-hidden="true"
                        />

                        <p className="mt-4 font-heading text-xl font-bold">
                            Daftar jurusan belum tersedia
                        </p>

                        <p className="mt-2 text-aw-muted">
                            Program keahlian akan tampil di sini setelah
                            diaktifkan oleh sekolah.
                        </p>
                    </div>
                ) : (
                    <div className="-mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {majors.map((major, index) => (
                            <MajorCard
                                key={major.id}
                                major={major}
                                eager={index < 3}
                            />
                        ))}
                    </div>
                )}
            </WidgetWrapper>

            <PpdbBanner />
        </PublicLayout>
    );
}

import { GraduationCap } from 'lucide-react';

import MajorCard from '@/components/public/major-card';
import PublicLayout from '@/layouts/public-layout';
import type { MajorCard as MajorCardData, Seo } from '@/types';

type JurusanIndexProps = {
    majors: MajorCardData[];
    seo: Seo;
};

export default function JurusanIndex({ majors, seo }: JurusanIndexProps) {
    return (
        <PublicLayout seo={seo}>
            <header className="border-b border-charcoal/10 bg-mist">
                <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
                    <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
                        <span
                            className="h-px w-8 bg-brand-accent"
                            aria-hidden="true"
                        />
                        Program Keahlian
                    </p>

                    <h1 className="mt-4 max-w-2xl font-display text-[30px] leading-tight font-semibold text-onyx sm:text-4xl lg:text-5xl">
                        Pilih jurusan yang sesuai denganmu
                    </h1>

                    <p className="mt-4 max-w-xl text-base text-charcoal">
                        Setiap program keahlian punya fokus kompetensi dan
                        prospek yang berbeda. Bandingkan sebelum memutuskan.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
                {majors.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-charcoal/25 px-6 py-14 text-center">
                        <GraduationCap
                            className="mx-auto size-8 text-brand/40"
                            aria-hidden="true"
                        />

                        <p className="mt-4 font-display text-xl font-semibold text-onyx">
                            Daftar jurusan belum tersedia
                        </p>

                        <p className="mt-2 text-[15px] text-charcoal">
                            Program keahlian akan tampil di sini setelah
                            diaktifkan oleh sekolah.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {majors.map((major, index) => (
                            <MajorCard
                                key={major.id}
                                major={major}
                                eager={index < 3}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

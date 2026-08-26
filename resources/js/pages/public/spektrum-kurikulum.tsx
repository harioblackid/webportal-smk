import HeroText from '@/components/public/hero-text';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import type { Seo, Spectrum } from '@/types';

type SpektrumKurikulumProps = {
    spectra: Spectrum[];
    seo: Seo;
};

/**
 * Profil > Spektrum Kurikulum. Deliberately only the mata pelajaran: no jam,
 * no capaian pembelajaran — a table of hours would be stale within a term.
 */
export default function SpektrumKurikulum({
    spectra,
    seo,
}: SpektrumKurikulumProps) {
    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Profil Sekolah"
                title="Spektrum kurikulum"
                subtitle="Mata pelajaran yang ditempuh peserta didik pada setiap spektrum kurikulum yang berlaku."
            />

            <WidgetWrapper containerClass="max-w-5xl">
                {spectra.length === 0 ? (
                    <p className="rounded-md bg-gray-100 p-6 text-lg text-aw-muted dark:bg-slate-800">
                        Spektrum kurikulum belum diisi.
                    </p>
                ) : (
                    <div className="space-y-12">
                        {spectra.map((spectrum) => (
                            <section key={spectrum.id}>
                                <h2 className="font-heading text-2xl font-bold tracking-tighter md:text-3xl">
                                    {spectrum.name}
                                </h2>

                                {spectrum.description === null ? null : (
                                    <p className="mt-2 text-aw-muted">
                                        {spectrum.description}
                                    </p>
                                )}

                                {spectrum.groups.length === 0 ? (
                                    <p className="mt-4 text-aw-muted">
                                        Daftar mata pelajaran belum diisi.
                                    </p>
                                ) : (
                                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                                        {spectrum.groups.map((group, index) => (
                                            <div
                                                key={group.label ?? index}
                                                className="rounded-lg border border-gray-200 p-5 dark:border-gray-700"
                                            >
                                                {group.label === null ? null : (
                                                    <h3 className="mb-3 font-heading text-lg font-semibold">
                                                        {group.label}
                                                    </h3>
                                                )}

                                                <ol className="list-inside list-decimal space-y-1 text-aw-default marker:text-aw-muted">
                                                    {group.subjects.map(
                                                        (subject) => (
                                                            <li key={subject}>
                                                                {subject}
                                                            </li>
                                                        ),
                                                    )}
                                                </ol>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </WidgetWrapper>
        </PublicLayout>
    );
}

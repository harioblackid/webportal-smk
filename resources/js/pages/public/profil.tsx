import { Quote } from 'lucide-react';

import PublicLayout from '@/layouts/public-layout';
import type { Seo } from '@/types';

type ProfilProps = {
    seo: Seo;
};

/*
 * FR4-15 keeps this copy in code rather than in the CMS.
 *
 * PLACEHOLDER: the wording below is a structural draft so the page can ship
 * complete. Sambutan, sejarah, and visi-misi must be replaced with the text the
 * school supplies (OQ-2) before launch — nothing here states a date, a name, or
 * a figure, precisely so that no invented fact goes out under the school's name.
 */
const misi = [
    'Menyelenggarakan pembelajaran kejuruan yang selaras dengan kebutuhan dunia kerja.',
    'Menumbuhkan karakter, kedisiplinan, dan sikap profesional pada setiap peserta didik.',
    'Mengembangkan kompetensi guru dan tenaga kependidikan secara berkelanjutan.',
    'Menjalin kemitraan dengan dunia usaha dan dunia industri untuk praktik dan penyaluran lulusan.',
];

export default function Profil({ seo }: ProfilProps) {
    return (
        <PublicLayout seo={seo}>
            <header className="border-b border-charcoal/10 bg-mist">
                <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
                    <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
                        <span
                            className="h-px w-8 bg-brand-accent"
                            aria-hidden="true"
                        />
                        Profil Sekolah
                    </p>

                    <h1 className="mt-4 max-w-2xl font-display text-[30px] leading-tight font-semibold text-onyx sm:text-4xl lg:text-5xl">
                        Mengenal SMK PGRI Telagasari
                    </h1>
                </div>
            </header>

            <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:py-14">
                <section aria-labelledby="sambutan">
                    <h2
                        id="sambutan"
                        className="font-display text-2xl font-semibold text-onyx sm:text-3xl"
                    >
                        Sambutan kepala sekolah
                    </h2>

                    <blockquote className="mt-6 border-l-2 border-brand-accent pl-5">
                        <Quote
                            className="size-6 text-brand/40"
                            aria-hidden="true"
                        />

                        <p className="mt-3 font-display text-lg leading-relaxed text-onyx">
                            Selamat datang di portal resmi SMK PGRI Telagasari.
                            Kami percaya pendidikan kejuruan bukan sekadar
                            mengajarkan keterampilan, melainkan menyiapkan
                            peserta didik untuk melangkah percaya diri ke dunia
                            kerja maupun pendidikan lanjut.
                        </p>

                        <p className="mt-4 text-[15px] leading-relaxed text-charcoal">
                            Melalui laman ini kami membuka informasi sekolah
                            seluas-luasnya bagi calon peserta didik dan orang
                            tua: program keahlian yang tersedia, kegiatan
                            sekolah, serta cara menghubungi kami. Semoga
                            informasi di sini membantu Anda mengambil keputusan
                            terbaik.
                        </p>

                        <footer className="mt-5 text-sm font-semibold text-charcoal">
                            Kepala SMK PGRI Telagasari
                        </footer>
                    </blockquote>
                </section>

                <section aria-labelledby="sejarah" className="mt-14">
                    <h2
                        id="sejarah"
                        className="font-display text-2xl font-semibold text-onyx sm:text-3xl"
                    >
                        Sejarah singkat
                    </h2>

                    <div className="rich-text mt-5">
                        <p>
                            SMK PGRI Telagasari berdiri dan berkembang sebagai
                            bagian dari ikhtiar Persatuan Guru Republik
                            Indonesia untuk memperluas akses pendidikan kejuruan
                            di lingkungan Telagasari dan sekitarnya.
                        </p>

                        <p>
                            Sejak awal, sekolah berfokus pada penyelenggaraan
                            program keahlian yang relevan dengan kebutuhan
                            masyarakat sekitar, dengan penekanan pada praktik
                            dan pembentukan karakter kerja.
                        </p>
                    </div>
                </section>

                <section aria-labelledby="visi-misi" className="mt-14">
                    <h2
                        id="visi-misi"
                        className="font-display text-2xl font-semibold text-onyx sm:text-3xl"
                    >
                        Visi & misi
                    </h2>

                    <div className="mt-6 rounded-2xl bg-mist p-6">
                        <h3 className="text-sm font-semibold tracking-[0.14em] text-brand uppercase">
                            Visi
                        </h3>

                        <p className="mt-3 font-display text-xl leading-snug font-semibold text-onyx">
                            Menjadi sekolah menengah kejuruan yang menghasilkan
                            lulusan berkarakter, kompeten, dan siap bersaing di
                            dunia kerja.
                        </p>
                    </div>

                    <h3 className="mt-8 text-sm font-semibold tracking-[0.14em] text-brand uppercase">
                        Misi
                    </h3>

                    <ol className="mt-4 space-y-4">
                        {misi.map((item, index) => (
                            <li key={item} className="flex gap-4">
                                <span
                                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
                                    aria-hidden="true"
                                >
                                    {index + 1}
                                </span>
                                <span className="text-[15px] leading-relaxed text-charcoal">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section aria-labelledby="yayasan" className="mt-14">
                    <h2
                        id="yayasan"
                        className="font-display text-2xl font-semibold text-onyx sm:text-3xl"
                    >
                        Identitas yayasan
                    </h2>

                    <div className="rich-text mt-5">
                        <p>
                            SMK PGRI Telagasari berada di bawah naungan{' '}
                            <strong className="text-onyx">
                                YPLP Dasar Menengah PGRI
                            </strong>
                            , badan penyelenggara satuan pendidikan dasar dan
                            menengah di lingkungan Persatuan Guru Republik
                            Indonesia.
                        </p>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}

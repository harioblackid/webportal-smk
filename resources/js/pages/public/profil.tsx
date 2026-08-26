import Content from '@/components/public/content';
import HeroText from '@/components/public/hero-text';
import Steps from '@/components/public/steps';
import PublicLayout from '@/layouts/public-layout';
import type { Seo } from '@/types';

type ProfilProps = {
    seo: Seo;
};

/*
 * This copy lives in code rather than in the CMS.
 *
 * PLACEHOLDER: the wording below is a structural draft so the page can ship
 * complete. Sambutan, sejarah, and visi-misi must be replaced with the text the
 * school supplies before launch — nothing here states a date, a name, or a
 * figure, precisely so that no invented fact goes out under the school's name.
 */
const misi = [
    {
        title: 'Pembelajaran kejuruan yang relevan',
        description:
            'Menyelenggarakan pembelajaran yang selaras dengan kebutuhan dunia kerja.',
    },
    {
        title: 'Karakter dan kedisiplinan',
        description:
            'Menumbuhkan karakter, kedisiplinan, dan sikap profesional pada setiap peserta didik.',
    },
    {
        title: 'Guru yang terus berkembang',
        description:
            'Mengembangkan kompetensi guru dan tenaga kependidikan secara berkelanjutan.',
    },
    {
        title: 'Kemitraan dengan industri',
        description:
            'Menjalin kemitraan dengan dunia usaha dan dunia industri untuk praktik dan penyaluran lulusan.',
    },
];

export default function Profil({ seo }: ProfilProps) {
    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Profil Sekolah"
                title="Mengenal SMK PGRI Telagasari"
                subtitle="Sekolah menengah kejuruan di bawah naungan YPLP Dasar Menengah PGRI, dengan fokus pada praktik dan pembentukan karakter kerja."
            />

            <Content
                id="sambutan"
                tagline="Sambutan"
                title="Sambutan kepala sekolah"
                isAfterContent
                content={
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-aw-primary">
                        <blockquote>
                            Selamat datang di portal resmi SMK PGRI Telagasari.
                            Kami percaya pendidikan kejuruan bukan sekadar
                            mengajarkan keterampilan, melainkan menyiapkan
                            peserta didik untuk melangkah percaya diri ke dunia
                            kerja maupun pendidikan lanjut.
                        </blockquote>

                        <p>
                            Melalui laman ini kami membuka informasi sekolah
                            seluas-luasnya bagi calon peserta didik dan orang
                            tua: program keahlian yang tersedia, kegiatan
                            sekolah, serta cara menghubungi kami. Semoga
                            informasi di sini membantu Anda mengambil keputusan
                            terbaik.
                        </p>

                        <p className="font-semibold">
                            Kepala SMK PGRI Telagasari
                        </p>
                    </div>
                }
            />

            <Content
                id="sejarah"
                tagline="Sejarah"
                title="Sejarah singkat"
                isReversed
                isAfterContent
                content={
                    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading">
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
                }
            />

            <Steps
                id="visi-misi"
                tagline="Visi & misi"
                title="Menjadi SMK yang menghasilkan lulusan berkarakter, kompeten, dan siap bersaing"
                subtitle="Visi itu diterjemahkan ke dalam empat misi berikut."
                items={misi}
            />

            <Content
                id="yayasan"
                tagline="Yayasan"
                title="Identitas yayasan"
                isAfterContent
                content={
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        <p>
                            SMK PGRI Telagasari berada di bawah naungan{' '}
                            <strong>YPLP Dasar Menengah PGRI</strong>, badan
                            penyelenggara satuan pendidikan dasar dan menengah
                            di lingkungan Persatuan Guru Republik Indonesia.
                        </p>
                    </div>
                }
            />
        </PublicLayout>
    );
}

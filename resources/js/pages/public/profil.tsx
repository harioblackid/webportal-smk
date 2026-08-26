import Content from '@/components/public/content';
import HeroText from '@/components/public/hero-text';
import SiteImage from '@/components/public/site-image';
import Steps from '@/components/public/steps';
import PublicLayout from '@/layouts/public-layout';
import type { Mission, ProfileSection, Seo } from '@/types';

type ProfilProps = {
    /** Fixed set, in render order, straight from ProfileSection::KEYS. */
    sections: ProfileSection[];
    missions: Mission[];
    seo: Seo;
};

/**
 * Profil > Visi Misi. Every word here is CMS-managed: sambutan, sejarah, visi,
 * yayasan, and the misi list, all editable under /admin/profile-sections.
 */
export default function Profil({ sections, missions, seo }: ProfilProps) {
    const byKey = new Map(sections.map((section) => [section.key, section]));

    const prose = (section: ProfileSection) => (
        <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-aw-primary"
            dangerouslySetInnerHTML={{ __html: section.body ?? '' }}
        />
    );

    const image = (section: ProfileSection) =>
        section.image === null ? undefined : (
            <SiteImage
                image={section.image}
                ratio="aspect-[4/3]"
                className="w-full rounded-md"
            />
        );

    const sambutan = byKey.get('sambutan');
    const sejarah = byKey.get('sejarah');
    const visi = byKey.get('visi');
    const yayasan = byKey.get('yayasan');

    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Profil Sekolah"
                title="Mengenal SMK PGRI Telagasari"
                subtitle="Sekolah menengah kejuruan di bawah naungan YPLP Dasar Menengah PGRI, dengan fokus pada praktik dan pembentukan karakter kerja."
            />

            {sambutan?.title != null && (
                <Content
                    id="sambutan"
                    tagline="Sambutan"
                    title={sambutan.title}
                    isAfterContent
                    content={prose(sambutan)}
                    image={image(sambutan)}
                />
            )}

            {sejarah?.title != null && (
                <Content
                    id="sejarah"
                    tagline="Sejarah"
                    title={sejarah.title}
                    isReversed
                    isAfterContent
                    content={prose(sejarah)}
                    image={image(sejarah)}
                />
            )}

            {visi?.title != null && missions.length > 0 && (
                <Steps
                    id="visi-misi"
                    tagline="Visi & misi"
                    title={visi.title}
                    // Plain text, not markup: this lands inside the headline's
                    // <p>, where a block element would be illegal nesting and
                    // would fail hydration. The server strips it either way.
                    subtitle={visi.body ?? undefined}
                    items={missions}
                    image={image(visi)}
                />
            )}

            {yayasan?.title != null && (
                <Content
                    id="yayasan"
                    tagline="Yayasan"
                    title={yayasan.title}
                    isAfterContent
                    content={prose(yayasan)}
                    image={image(yayasan)}
                />
            )}
        </PublicLayout>
    );
}

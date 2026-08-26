import { Link, usePage } from '@inertiajs/react';
import { BookOpen, MapPin, Users } from 'lucide-react';

import { buttonClasses } from '@/components/public/button';
import type { FeatureItem } from '@/components/public/features';
import Features from '@/components/public/features';
import Headline from '@/components/public/headline';
import Hero from '@/components/public/hero';
import NewsCard from '@/components/public/news-card';
import PpdbBanner from '@/components/public/ppdb-banner';
import SiteImage from '@/components/public/site-image';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import { profil } from '@/routes';
import { index as majorsIndex } from '@/routes/majors';
import { index as postsIndex } from '@/routes/posts';
import type { Hero as HeroData, NewsCard as NewsCardData, Seo } from '@/types';

type HomeProps = {
    hero: HeroData | null;
    posts: NewsCardData[];
    seo: Seo;
};

/** Fixed sections, deliberately not a page builder. */
const highlights: FeatureItem[] = [
    {
        icon: BookOpen,
        title: 'Program keahlian terarah',
        description:
            'Kurikulum kejuruan yang menyiapkan lulusan untuk bekerja, berwirausaha, atau melanjutkan studi.',
    },
    {
        icon: Users,
        title: 'Di bawah naungan PGRI',
        description:
            'Dikelola YPLP Dasar Menengah PGRI dengan tata kelola sekolah yang terbuka bagi orang tua.',
    },
];

export default function Home({ hero, posts, seo }: HomeProps) {
    const site = usePage().props.site;
    const heading = hero?.title ?? site.name;
    const subheading =
        hero?.subtitle ??
        site.tagline ??
        'Sekolah menengah kejuruan di bawah naungan YPLP Dasar Menengah PGRI.';

    return (
        <PublicLayout seo={seo}>
            <Hero
                tagline="Portal Resmi Sekolah"
                title={heading}
                subtitle={subheading}
                actions={
                    hero !== null && hero.ctas.length > 0 ? (
                        hero.ctas.map((cta, index) => (
                            <div
                                key={cta.url}
                                className="flex w-full sm:w-auto"
                            >
                                <a
                                    href={cta.url}
                                    className={buttonClasses(
                                        index === 0 ? 'primary' : 'secondary',
                                        'w-full sm:mb-0',
                                    )}
                                >
                                    {cta.text}
                                </a>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="flex w-full sm:w-auto">
                                <Link
                                    href={majorsIndex()}
                                    className={buttonClasses(
                                        'primary',
                                        'w-full sm:mb-0',
                                    )}
                                >
                                    Jelajahi jurusan
                                </Link>
                            </div>
                            <div className="flex w-full sm:w-auto">
                                <Link
                                    href={profil()}
                                    className={buttonClasses(
                                        'secondary',
                                        'w-full sm:mb-0',
                                    )}
                                >
                                    Profil sekolah
                                </Link>
                            </div>
                        </>
                    )
                }
                image={
                    <SiteImage
                        image={hero?.image ?? null}
                        ratio="aspect-[16/9]"
                        className="mx-auto w-full rounded-md"
                        eager
                    />
                }
            />

            <Features
                id="sekilas"
                tagline="Sekilas sekolah"
                title="Kenapa SMK PGRI Telagasari"
                subtitle={
                    site.contact.address === null ? undefined : (
                        <span className="inline-flex items-start gap-2">
                            <MapPin
                                className="mt-1 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            {site.contact.address}
                        </span>
                    )
                }
                items={highlights}
                columns={2}
            />

            <WidgetWrapper id="berita" containerClass="max-w-6xl">
                <Headline
                    id="berita-title"
                    tagline="Kabar sekolah"
                    title="Berita terbaru"
                    subtitle="Kegiatan, prestasi, dan pengumuman resmi dari sekolah."
                />

                {posts.length === 0 ? (
                    <p className="rounded-md bg-gray-100 p-6 text-lg text-aw-muted dark:bg-slate-800">
                        Belum ada berita yang diterbitkan. Kabar terbaru akan
                        muncul di sini.
                    </p>
                ) : (
                    <div className="-mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, index) => (
                            <NewsCard
                                key={post.id}
                                post={post}
                                eager={index < 3}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Link
                        href={postsIndex()}
                        className={buttonClasses('tertiary')}
                    >
                        Lihat semua berita
                    </Link>
                </div>
            </WidgetWrapper>

            <PpdbBanner />
        </PublicLayout>
    );
}

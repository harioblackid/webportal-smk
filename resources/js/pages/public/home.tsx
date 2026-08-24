import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, MapPin, Users } from 'lucide-react';

import NewsCard from '@/components/public/news-card';
import PpdbBanner from '@/components/public/ppdb-banner';
import SiteImage from '@/components/public/site-image';
import { buttonClasses } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { profil } from '@/routes';
import { index as majorsIndex } from '@/routes/majors';
import { index as postsIndex } from '@/routes/posts';
import type { Hero, NewsCard as NewsCardData, Seo } from '@/types';

type HomeProps = {
    hero: Hero | null;
    posts: NewsCardData[];
    seo: Seo;
};

/** FR4-5: fixed sections, deliberately not a page builder. */
const highlights = [
    {
        icon: BookOpen,
        title: 'Program keahlian terarah',
        body: 'Kurikulum kejuruan yang menyiapkan lulusan untuk bekerja, berwirausaha, atau melanjutkan studi.',
        href: majorsIndex(),
        label: 'Lihat jurusan',
    },
    {
        icon: Users,
        title: 'Di bawah naungan PGRI',
        body: 'Dikelola YPLP Dasar Menengah PGRI dengan tata kelola sekolah yang terbuka bagi orang tua.',
        href: profil(),
        label: 'Baca profil',
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
            {/*
             * prd-03 section 4: the text column runs wide and the image column
             * breaks out of the grid on the right, not a centred card.
             */}
            <section className="relative overflow-hidden bg-mist">
                <span
                    className="absolute top-0 left-0 h-1.5 w-full bg-brand"
                    aria-hidden="true"
                />

                <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-14 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-24">
                    <div className="reveal lg:col-span-7 lg:self-center">
                        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
                            <span
                                className="h-px w-8 bg-brand-accent"
                                aria-hidden="true"
                            />
                            Portal Resmi Sekolah
                        </p>

                        <h1 className="mt-5 font-display text-[32px] leading-[1.1] font-semibold text-balance text-onyx sm:text-5xl lg:text-[56px]">
                            {heading}
                        </h1>

                        <p className="mt-5 max-w-xl text-base text-charcoal sm:text-lg">
                            {subheading}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {hero !== null && hero.ctas.length > 0 ? (
                                hero.ctas.map((cta, index) => (
                                    <a
                                        key={cta.url}
                                        href={cta.url}
                                        className={buttonClasses(
                                            index === 0
                                                ? 'primary'
                                                : 'secondary',
                                        )}
                                    >
                                        {cta.text}
                                    </a>
                                ))
                            ) : (
                                <>
                                    <Link
                                        href={majorsIndex()}
                                        className={buttonClasses('primary')}
                                    >
                                        Jelajahi jurusan
                                    </Link>
                                    <Link
                                        href={profil()}
                                        className={buttonClasses('secondary')}
                                    >
                                        Profil sekolah
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div
                        className="reveal relative lg:col-span-5"
                        style={{ animationDelay: '120ms' }}
                    >
                        <span
                            className="absolute -top-4 -right-4 hidden size-32 rounded-2xl bg-brand-accent/25 lg:block"
                            aria-hidden="true"
                        />

                        <SiteImage
                            image={hero?.image ?? null}
                            ratio="aspect-[4/3] lg:aspect-[4/5]"
                            className="relative rounded-2xl shadow-xl shadow-onyx/10 lg:-mr-6"
                            eager
                        />
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-5 sm:px-6">
                <section
                    aria-labelledby="sekilas"
                    className="border-b border-charcoal/10 py-12 lg:py-16"
                >
                    <h2
                        id="sekilas"
                        className="font-display text-2xl font-semibold text-onyx sm:text-3xl lg:text-4xl"
                    >
                        Sekilas sekolah
                    </h2>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                        {highlights.map(
                            ({ icon: Icon, title, body, href, label }) => (
                                <div
                                    key={title}
                                    className="border-l-2 border-brand-accent pl-5"
                                >
                                    <Icon
                                        className="size-6 text-brand"
                                        aria-hidden="true"
                                    />

                                    <h3 className="mt-3 text-lg font-semibold text-onyx">
                                        {title}
                                    </h3>

                                    <p className="mt-2 text-[15px] text-charcoal">
                                        {body}
                                    </p>

                                    <Link
                                        href={href}
                                        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-accent"
                                    >
                                        {label}
                                        <ArrowRight
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </div>
                            ),
                        )}
                    </div>

                    {site.contact.address !== null && (
                        <p className="mt-8 flex items-start gap-2 text-sm text-charcoal">
                            <MapPin
                                className="mt-0.5 size-4 shrink-0 text-brand"
                                aria-hidden="true"
                            />
                            {site.contact.address}
                        </p>
                    )}
                </section>

                <section aria-labelledby="berita" className="py-12 lg:py-16">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h2
                            id="berita"
                            className="font-display text-2xl font-semibold text-onyx sm:text-3xl lg:text-4xl"
                        >
                            Berita terbaru
                        </h2>

                        <Link
                            href={postsIndex()}
                            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-accent"
                        >
                            Lihat semua berita
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>

                    {posts.length === 0 ? (
                        <p className="mt-8 rounded-xl bg-mist p-6 text-[15px] text-charcoal">
                            Belum ada berita yang diterbitkan. Kabar terbaru
                            akan muncul di sini.
                        </p>
                    ) : (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post, index) => (
                                <NewsCard
                                    key={post.id}
                                    post={post}
                                    eager={index < 3}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <div className="pb-4">
                    <PpdbBanner />
                </div>
            </div>
        </PublicLayout>
    );
}

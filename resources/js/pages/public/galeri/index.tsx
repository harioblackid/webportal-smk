import { Link } from '@inertiajs/react';

import HeroText from '@/components/public/hero-text';
import SiteImage from '@/components/public/site-image';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import type { GalleryAlbumCard, Seo } from '@/types';

type GaleriIndexProps = {
    albums: GalleryAlbumCard[];
    seo: Seo;
};

export default function GaleriIndex({ albums, seo }: GaleriIndexProps) {
    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Galeri"
                title="Dokumentasi kegiatan sekolah"
                subtitle="Kegiatan belajar, praktik kejuruan, prestasi, dan acara sekolah, dikelompokkan per album."
            />

            <WidgetWrapper containerClass="max-w-6xl">
                {albums.length === 0 ? (
                    <p className="rounded-md bg-gray-100 p-6 text-lg text-aw-muted dark:bg-slate-800">
                        Belum ada album foto yang diterbitkan.
                    </p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {albums.map((album, index) => (
                            <Link
                                key={album.id}
                                href={album.url}
                                className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-slate-900"
                            >
                                <SiteImage
                                    image={album.image}
                                    ratio="aspect-[4/3]"
                                    className="w-full"
                                    eager={index < 3}
                                    thumb
                                />

                                <div className="flex flex-1 flex-col p-5">
                                    <h2 className="font-heading text-lg font-bold tracking-tight group-hover:text-aw-primary">
                                        {album.title}
                                    </h2>

                                    {album.description === null ? null : (
                                        <p className="mt-2 line-clamp-3 text-sm text-aw-muted">
                                            {album.description}
                                        </p>
                                    )}

                                    <p className="mt-auto pt-4 text-sm text-aw-muted">
                                        {album.photoCount} foto
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </WidgetWrapper>
        </PublicLayout>
    );
}

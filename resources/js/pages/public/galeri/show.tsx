import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { buttonClasses } from '@/components/public/button';
import HeroText from '@/components/public/hero-text';
import SiteImage from '@/components/public/site-image';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import { index as galleryIndex } from '@/routes/gallery';
import type { GalleryPhoto, Seo } from '@/types';

type GaleriShowProps = {
    album: {
        title: string;
        slug: string;
        description: string | null;
    };
    photos: GalleryPhoto[];
    seo: Seo;
};

export default function GaleriShow({ album, photos, seo }: GaleriShowProps) {
    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Galeri"
                title={album.title}
                subtitle={album.description ?? undefined}
            />

            <WidgetWrapper containerClass="max-w-6xl">
                {photos.length === 0 ? (
                    <p className="rounded-md bg-gray-100 p-6 text-lg text-aw-muted dark:bg-slate-800">
                        Album ini belum berisi foto.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {photos.map((photo, index) => (
                            <figure
                                key={photo.id}
                                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <SiteImage
                                    image={photo.image}
                                    ratio="aspect-[4/3]"
                                    className="w-full"
                                    eager={index < 3}
                                />

                                {photo.caption === null ? null : (
                                    <figcaption className="px-4 py-3 text-sm text-aw-muted">
                                        {photo.caption}
                                    </figcaption>
                                )}
                            </figure>
                        ))}
                    </div>
                )}

                <div className="mt-10 flex justify-center">
                    <Link
                        href={galleryIndex()}
                        className={buttonClasses('tertiary')}
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Semua album
                    </Link>
                </div>
            </WidgetWrapper>
        </PublicLayout>
    );
}

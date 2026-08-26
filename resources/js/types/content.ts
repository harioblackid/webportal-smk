import type { Image } from '@/types/site';

/**
 * One slide of the front-page hero carousel (FR4-1).
 *
 * `postUrl` is the tautan berita, already resolved server-side: it is null
 * whenever the linked berita is a draft, scheduled, or withdrawn.
 */
export type HeroSlide = {
    id: number;
    title: string;
    subtitle: string | null;
    image: Image | null;
    postUrl: string | null;
    postLinkText: string | null;
    ctas: {
        text: string;
        url: string;
    }[];
};

export type CategoryLink = {
    name: string;
    slug: string;
    url: string;
};

export type NewsCard = {
    id: number;
    title: string;
    slug: string;
    url: string;
    excerpt: string | null;
    type: string;
    category: CategoryLink | null;
    publishedAt: string | null;
    publishedAtLabel: string | null;
    image: Image | null;
};

export type PostDetail = NewsCard & {
    /** Rich text from the CMS. */
    body: string;
};

export type MajorCard = {
    id: number;
    name: string;
    slug: string;
    url: string;
    excerpt: string | null;
    image: Image | null;
};

export type MajorDetail = MajorCard & {
    description: string | null;
    extra: string | null;
};

/** One page of a Laravel LengthAwarePaginator, as Inertia receives it. */
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

/** One section of the Visi Misi page, keyed by ProfileSection::KEYS. */
export type ProfileSection = {
    key: string;
    title: string | null;
    /** Sanitised rich text; rendered through `prose`. */
    body: string | null;
    image: Image | null;
};

/**
 * One butir misi. `description` is optional so it slots straight into the
 * Timeline items that widgets/Steps expects.
 */
export type Mission = {
    title: string;
    description: string | null;
};

/** One kelompok of mata pelajaran; `label` is null when the school lists them flat. */
export type SpectrumGroup = {
    label: string | null;
    subjects: string[];
};

export type Spectrum = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    groups: SpectrumGroup[];
};

export type GalleryAlbumCard = {
    id: number;
    title: string;
    slug: string;
    url: string;
    description: string | null;
    photoCount: number;
    image: Image | null;
};

/** A photo inside an album; `image` is never null by the time it reaches here. */
export type GalleryPhoto = {
    id: number;
    caption: string | null;
    image: Image | null;
};

export type ExtracurricularCard = {
    id: number;
    name: string;
    slug: string;
    /** Sanitised rich text; rendered through `prose`. */
    description: string | null;
    pembina: string | null;
    jadwal: string | null;
    image: Image | null;
};

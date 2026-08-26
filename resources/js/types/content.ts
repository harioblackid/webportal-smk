import type { Image } from '@/types/site';

/** The active Hero from the CMS (FR4-1); null when none is active. */
export type Hero = {
    title: string;
    subtitle: string | null;
    image: Image | null;
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

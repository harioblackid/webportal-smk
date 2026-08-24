/** Media in the shape ImageResource sends it. */
export type Image = {
    url: string;
    thumbUrl: string;
    /** Never null — AD-3 requires alt on every content image. */
    alt: string;
};

/** Per-page metadata built by App\Support\Seo (FR6-3, FR6-5). */
export type Seo = {
    title: string;
    description: string | null;
    image: Image | null;
    type: string;
};

/** Shared prop from SiteSettings::share() — school identity, contact, PPDB. */
export type Site = {
    name: string;
    tagline: string | null;
    /** Absolute base for canonical and og:url (FR6-4). */
    url: string;
    contact: {
        address: string | null;
        phone: string | null;
        phoneHref: string | null;
        whatsapp: string | null;
        whatsappHref: string | null;
        email: string | null;
    };
    ppdb: {
        enabled: boolean;
        url: string | null;
        image: Image | null;
    };
};

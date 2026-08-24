import { Head, usePage } from '@inertiajs/react';

import type { Seo } from '@/types';

type SeoHeadProps = {
    seo: Seo;
};

/**
 * FR6-6 — one place that owns title, description, canonical, and the
 * OG/Twitter pair, so no page can ship with half a metadata block.
 *
 * The values arrive from App\Support\Seo rather than being derived here: the
 * server already has the post title and excerpt the body was rendered from.
 */
export default function SeoHead({ seo }: SeoHeadProps) {
    const { props, url } = usePage();
    const site = props.site;

    // FR6-4: absolute, and built from APP_URL rather than the request host, so
    // a request arriving on the wrong hostname still points at the canonical.
    const canonical = `${site.url}${url}`;
    const image = seo.image?.url ?? null;
    const description = seo.description;
    const title = `${seo.title} - ${site.name}`;

    return (
        <Head title={seo.title}>
            <link rel="canonical" href={canonical} />

            <meta property="og:type" content={seo.type} />
            <meta property="og:site_name" content={site.name} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={title} />
            <meta property="og:locale" content="id_ID" />
            <meta name="twitter:title" content={title} />
            <meta
                name="twitter:card"
                content={image === null ? 'summary' : 'summary_large_image'}
            />

            {description !== null && (
                <meta name="description" content={description} />
            )}
            {description !== null && (
                <meta property="og:description" content={description} />
            )}
            {description !== null && (
                <meta name="twitter:description" content={description} />
            )}

            {image !== null && <meta property="og:image" content={image} />}
            {image !== null && <meta name="twitter:image" content={image} />}
            {seo.image !== null && (
                <meta property="og:image:alt" content={seo.image.alt} />
            )}
        </Head>
    );
}

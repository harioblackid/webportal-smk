type JsonLdProps = {
    data: Record<string, unknown>;
};

/**
 * Structured data for FR6-11 / FR6-12, rendered in the document body.
 *
 * Inertia's <Head> only serialises a fixed set of meta and link tags, and
 * Google reads ld+json anywhere in the page — so this belongs here rather
 * than in the head.
 *
 * `<` is escaped because a CMS-authored title containing "</script>" would
 * otherwise close this block early.
 */
export default function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replaceAll('<', '\u003c'),
            }}
        />
    );
}

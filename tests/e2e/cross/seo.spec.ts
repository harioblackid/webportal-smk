import { expect, test } from '@playwright/test';

import { publicRoutes } from '../routes';

/**
 * FR6-1 — "lolos uji View Source".
 *
 * These assertions deliberately use `request`, not `page`: a browser context
 * cannot tell SSR from CSR, because after hydration the DOM is identical either
 * way. Only the raw HTML the server sent distinguishes them, and that is what a
 * crawler reads.
 *
 * If the SSR process is not running, Inertia degrades to client rendering
 * silently and these are the tests that turn red.
 */

/** The mount point Inertia ships when SSR produced nothing. */
const CSR_FALLBACK = '<div id="app"></div>';

test.describe('server-side rendering', () => {
    for (const route of publicRoutes) {
        test(`${route.name} dirender di server`, async ({ request }) => {
            const response = await request.get(route.path);

            expect(response.status()).toBe(200);

            const html = await response.text();

            expect(
                html,
                `${route.path} jatuh ke client-side rendering — proses SSR mati?`,
            ).not.toContain(CSR_FALLBACK);

            // Real content, not just a non-empty div.
            expect(html).toMatch(/<h1[^>]*>/);
        });
    }
});

test.describe('metadata per halaman ada di HTML awal', () => {
    for (const route of publicRoutes) {
        test(`${route.name} membawa metadata`, async ({ request }) => {
            const html = await (await request.get(route.path)).text();

            // FR6-3 — a title that is only the app name means SeoHead never ran.
            expect(html).toMatch(/<title[^>]*>[^<]+<\/title>/);
            expect(html).toContain('name="description"');
            // FR6-4
            expect(html).toContain('rel="canonical"');
            // FR6-5
            expect(html).toContain('property="og:title"');
            expect(html).toContain('property="og:image"');
            expect(html).toContain('name="twitter:card"');
            // FR6-22
            expect(html).toContain('lang="id"');
        });
    }
});

test.describe('data terstruktur', () => {
    test('beranda menyematkan JSON-LD organisasi (FR6-11)', async ({
        request,
    }) => {
        const html = await (await request.get('/')).text();

        expect(html).toContain('application/ld+json');
        expect(html).toContain('EducationalOrganization');
    });

    test('detail berita menyematkan NewsArticle (FR6-12)', async ({
        request,
    }) => {
        const listing = await (await request.get('/berita')).text();
        // Links are absolute (built from APP_URL), and the category chips share
        // the /berita/ prefix — both have to be accounted for.
        const match = listing.match(
            /href="(?:https?:\/\/[^"]*)?(\/berita\/(?!kategori\/)[a-z0-9-]+)"/,
        );

        expect(
            match,
            'tidak menemukan tautan berita di /berita',
        ).not.toBeNull();

        const html = await (await request.get(match![1])).text();

        expect(html).toContain('application/ld+json');
        expect(html).toMatch(/NewsArticle|"@type":\s*"Article"/);
    });
});

test.describe('indeksabilitas', () => {
    test('robots.txt melarang /admin dan menunjuk sitemap (FR6-10)', async ({
        request,
    }) => {
        const body = await (await request.get('/robots.txt')).text();

        expect(body).toContain('Disallow: /admin');
        expect(body).toContain('sitemap.xml');
    });

    test('sitemap.xml valid dan memuat berita (FR6-9)', async ({ request }) => {
        const response = await request.get('/sitemap.xml');

        expect(response.headers()['content-type']).toContain('xml');

        const body = await response.text();

        expect(body).toContain('<urlset');
        expect(body).toContain('/berita/');
        expect(body).toContain('/jurusan/');
        // The admin area must never be advertised.
        expect(body).not.toContain('/admin');
    });

    test('area admin mengirim noindex (FR6-2)', async ({ request }) => {
        const response = await request.get('/admin', {
            maxRedirects: 0,
            failOnStatusCode: false,
        });

        expect(response.headers()['x-robots-tag']).toContain('noindex');
    });
});

import type { ConsoleMessage, Page, Request } from '@playwright/test';
import { expect, test } from '@playwright/test';

import {
    detailSources,
    documentRoutes,
    firstBeritaPath,
    notFoundRoutes,
    publicRoutes,
} from '../routes';

/**
 * "Tidak ada element yang error pada lintas browser."
 *
 * The Pest suite asserts Inertia props, which are byte-identical in every
 * browser — it cannot see a hydration mismatch, a stylesheet that fails to
 * parse in WebKit, or an image that 404s. Those only surface in a real engine,
 * which is the entire reason this file exists.
 */

type PageFaults = {
    console: string[];
    pageErrors: string[];
    failedRequests: string[];
};

/**
 * Third-party origins are out of scope: /kontak embeds a Google Maps iframe,
 * and letting its availability decide whether our UI "has an error" makes the
 * suite flaky for reasons no code change here can fix. Same-origin failures are
 * never filtered — those are ours.
 */
const THIRD_PARTY = ['favicon', 'google', 'gstatic', 'gtag', 'doubleclick'];

function isIgnorable(text: string): boolean {
    const haystack = text.toLowerCase();

    return THIRD_PARTY.some((needle) => haystack.includes(needle));
}

/** A request is ours only when it shares the origin under test. */
function isSameOrigin(url: string, baseURL: string | undefined): boolean {
    if (baseURL === undefined) {
        return true;
    }

    try {
        return new URL(url).origin === new URL(baseURL).origin;
    } catch {
        return false;
    }
}

function watchForFaults(page: Page, baseURL?: string): PageFaults {
    const faults: PageFaults = {
        console: [],
        pageErrors: [],
        failedRequests: [],
    };

    page.on('console', (message: ConsoleMessage) => {
        if (message.type() !== 'error') {
            return;
        }

        const text = message.text();

        if (isIgnorable(text)) {
            return;
        }

        faults.console.push(text);
    });

    page.on('pageerror', (error: Error) => {
        faults.pageErrors.push(error.message);
    });

    page.on('requestfailed', (request: Request) => {
        const url = request.url();

        if (isIgnorable(url) || !isSameOrigin(url, baseURL)) {
            return;
        }

        faults.failedRequests.push(
            `${url} — ${request.failure()?.errorText ?? 'unknown'}`,
        );
    });

    return faults;
}

function expectNoFaults(faults: PageFaults) {
    expect(faults.pageErrors, 'uncaught JavaScript errors').toEqual([]);
    expect(faults.console, 'console errors').toEqual([]);
    expect(faults.failedRequests, 'failed network requests').toEqual([]);
}

test.describe('halaman publik bebas error di semua browser', () => {
    for (const route of publicRoutes) {
        test(`${route.name} (${route.path})`, async ({ page, baseURL }) => {
            const faults = watchForFaults(page, baseURL);
            const response = await page.goto(route.path);

            expect(response?.status(), `status ${route.path}`).toBe(200);
            await expect(page.locator('body')).toBeVisible();

            if (route.expect !== undefined) {
                await expect(page.locator('body')).toContainText(route.expect);
            }

            // Every public page must carry exactly one h1 — a missing or
            // duplicated one is both an a11y defect and an SEO one.
            await expect(page.locator('h1')).toHaveCount(1);

            expectNoFaults(faults);
        });
    }
});

test.describe('halaman detail dari data yang di-seed', () => {
    test('detail berita', async ({ page, baseURL, request }) => {
        // Berita are CMS content, not seeded, so a fresh database has none.
        // Skipping keeps the assertions below meaningful instead of turning
        // them into a test that passes because there was nothing to check.
        test.skip(
            (await firstBeritaPath(request)) === null,
            'belum ada berita di database',
        );

        const faults = watchForFaults(page, baseURL);

        await page.goto(detailSources.berita);

        // Category chips also live under /berita/, so exclude them by href
        // rather than by link text.
        const firstArticle = page
            .locator('a[href*="/berita/"]:not([href*="/berita/kategori/"])')
            .first();

        await expect(firstArticle).toBeVisible();
        await firstArticle.click();

        // Inertia swaps the page without a document navigation, so the default
        // `load` here waits on a lifecycle event that never fires again for
        // this document. `commit` is what the assertion actually needs: the
        // history entry the client pushed once the visit resolved.
        await page.waitForURL(/\/berita\/.+/, { waitUntil: 'commit' });
        await expect(page.locator('h1')).toHaveCount(1);
        // A detail page with no image means the fixture never attached one.
        await expect(page.locator('img').first()).toBeVisible();

        expectNoFaults(faults);
    });

    test('detail jurusan', async ({ page, baseURL }) => {
        const faults = watchForFaults(page, baseURL);

        await page.goto(detailSources.jurusan);

        const firstMajor = page.locator('a[href*="/jurusan/"]').first();

        await expect(firstMajor).toBeVisible();
        await firstMajor.click();

        // Client-side visit, as above.
        await page.waitForURL(/\/jurusan\/.+/, { waitUntil: 'commit' });
        await expect(page.locator('h1')).toHaveCount(1);

        expectNoFaults(faults);
    });
});

test.describe('status HTTP', () => {
    for (const route of notFoundRoutes) {
        // FR6-21: a soft 404 (200 + "not found" copy) gets the page indexed.
        test(`${route.name} mengembalikan 404`, async ({ page }) => {
            const response = await page.goto(route.path);

            expect(response?.status()).toBe(404);
        });
    }

    for (const route of documentRoutes) {
        test(`${route.name} tersedia`, async ({ request }) => {
            const response = await request.get(route.path);

            expect(response.status()).toBe(200);
        });
    }
});

test.describe('area admin tertutup untuk tamu', () => {
    test('tamu diarahkan ke login', async ({ page }) => {
        await page.goto('/admin');

        // page.goto follows the redirect, so the response here is /login's.
        // That the 302 itself carries X-Robots-Tag is asserted in seo.spec.ts,
        // which can look at the un-followed response.
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('body')).toContainText(/masuk|login/i);
    });
});

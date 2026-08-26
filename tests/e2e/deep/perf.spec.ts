import { expect, test } from '@playwright/test';

import { hasPublishedMedia } from '../routes';

/**
 * US-021 / FR6-14 / FR6-16 — Core Web Vitals on mobile.
 *
 * Every probe here needs photos on the page: with an empty hero there is no LCP
 * candidate to time, no lazy-loading contract to check, and nothing whose
 * format could be wrong. There is no content fixture, so each one asks
 * hasPublishedMedia() first and skips rather than passing on an empty page —
 * a budget that is met because the page is blank teaches nobody anything.
 *
 * That means these report as skipped on CI. US-021 / FR6-16 is verified by hand
 * with Lighthouse against a database that has real content.
 *
 * Chromium only — LargestContentfulPaint and layout-shift entries are not
 * implemented in WebKit or Firefox.
 */

const MOBILE = { width: 390, height: 844 };

/**
 * Timing is meaningless while five other browsers fight for the same CPU, so
 * this file runs as its own project and `npm run test:e2e:perf` gives it a
 * single worker. A flaky budget teaches people to ignore the budget.
 */
test.describe.configure({ mode: 'serial' });

/** FR6-16 targets, in milliseconds and unitless CLS. */
const LCP_BUDGET_MS = 2500;
const CLS_BUDGET = 0.1;

test.describe('core web vitals (mobile)', { tag: '@perf' }, () => {
    test.use({ viewport: MOBILE });

    test('beranda memenuhi anggaran LCP dan CLS', async ({ page, request }) => {
        test.skip(
            !(await hasPublishedMedia(request)),
            'beranda belum memuat media, LCP tidak bermakna',
        );

        await page.goto('/', { waitUntil: 'load' });

        const vitals = await page.evaluate(
            () =>
                new Promise<{ lcp: number; cls: number }>((resolve) => {
                    let lcp = 0;
                    let cls = 0;

                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            lcp = Math.max(lcp, entry.startTime);
                        }
                    }).observe({
                        type: 'largest-contentful-paint',
                        buffered: true,
                    });

                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            const shift = entry as PerformanceEntry & {
                                value: number;
                                hadRecentInput: boolean;
                            };

                            if (!shift.hadRecentInput) {
                                cls += shift.value;
                            }
                        }
                    }).observe({ type: 'layout-shift', buffered: true });

                    // LCP is only final once the page stops changing; a short
                    // settle window is the standard way to sample it in a test.
                    setTimeout(() => resolve({ lcp, cls }), 3000);
                }),
        );

        expect(vitals.lcp, 'LCP (ms)').toBeGreaterThan(0);
        expect(vitals.lcp, 'LCP (ms)').toBeLessThan(LCP_BUDGET_MS);
        expect(vitals.cls, 'CLS').toBeLessThan(CLS_BUDGET);
    });
});

test.describe('kontrak gambar (FR6-14)', { tag: '@perf' }, () => {
    test.use({ viewport: MOBILE });

    test('gambar hero dimuat eager, sisanya lazy', async ({
        page,
        request,
    }) => {
        test.skip(
            !(await hasPublishedMedia(request)),
            'beranda belum memuat media',
        );

        await page.goto('/');

        const images = page.locator('img');

        await expect(images.first()).toBeVisible();

        const loading = await images.evaluateAll((nodes) =>
            nodes.map((node) => (node as HTMLImageElement).loading),
        );

        expect(loading.length).toBeGreaterThan(1);
        // The LCP candidate must not wait on the lazy-loading heuristic.
        expect(loading[0], 'gambar pertama (kandidat LCP)').not.toBe('lazy');
        expect(
            loading.slice(1).some((value) => value === 'lazy'),
            'gambar di bawah lipatan harus lazy',
        ).toBe(true);
    });

    test('media tersaji dalam format modern, bukan jpeg', async ({
        page,
        request,
    }) => {
        test.skip(
            !(await hasPublishedMedia(request)),
            'beranda belum memuat media',
        );

        const served: string[] = [];

        page.on('response', (response) => {
            if (response.url().includes('/storage/media/')) {
                served.push(response.headers()['content-type'] ?? '');
            }
        });

        await page.goto('/');
        await expect(page.locator('img').first()).toBeVisible();

        expect(served.length, 'tidak ada media yang dimuat').toBeGreaterThan(0);

        // Photos are WebP; the crest stays PNG because it needs transparency,
        // and PNG is not the legacy format FR6-14 is aimed at. JPEG is.
        const legacy = served.filter((type) => type.includes('jpeg'));

        expect(legacy, 'media masih disajikan sebagai JPEG').toEqual([]);
        expect(served.some((type) => type.includes('webp'))).toBe(true);
    });

    test('setiap gambar konten punya alt (AD-3)', async ({ page }) => {
        await page.goto('/');

        const missing = await page
            .locator('img')
            .evaluateAll((nodes) =>
                nodes
                    .filter((node) => !node.hasAttribute('alt'))
                    .map((node) => (node as HTMLImageElement).src),
            );

        expect(missing, 'gambar tanpa atribut alt').toEqual([]);
    });
});

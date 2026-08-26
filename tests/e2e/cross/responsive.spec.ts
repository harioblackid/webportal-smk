import { expect, test } from '@playwright/test';

import { publicRoutes } from '../routes';

/**
 * Mobile-first checks (prd-01: ~80% of traffic is mobile).
 *
 * Horizontal overflow is the single most common responsive defect and the one
 * screenshots hide — the page looks fine until a fixed-width child pushes the
 * viewport sideways. Measuring scrollWidth catches it deterministically.
 */

const VIEWPORTS = [
    { name: 'ponsel 360px', width: 360, height: 780 },
    { name: 'tablet 768px', width: 768, height: 1024 },
    { name: 'desktop 1280px', width: 1280, height: 900 },
];

test.describe('tidak ada overflow horizontal', () => {
    for (const viewport of VIEWPORTS) {
        for (const route of publicRoutes) {
            test(`${route.name} @ ${viewport.name}`, async ({ page }) => {
                await page.setViewportSize({
                    width: viewport.width,
                    height: viewport.height,
                });
                await page.goto(route.path);
                await expect(page.locator('h1')).toHaveCount(1);

                const overflow = await page.evaluate(() => {
                    const doc = document.documentElement;

                    return {
                        scrollWidth: doc.scrollWidth,
                        clientWidth: doc.clientWidth,
                    };
                });

                // 1px of slack absorbs sub-pixel rounding, which is real and
                // differs between engines.
                expect(
                    overflow.scrollWidth,
                    `${route.path} meluber di ${viewport.width}px`,
                ).toBeLessThanOrEqual(overflow.clientWidth + 1);
            });
        }
    }
});

test.describe('navigasi mobile', () => {
    test.skip(
        ({ viewport }) => (viewport?.width ?? 0) >= 1024,
        'Menu toggle hanya tampil pada layar sempit.',
    );

    test('menu dapat dibuka dan menautkan ke halaman lain', async ({
        page,
    }) => {
        await page.goto('/');

        const toggle = page
            .getByRole('button', { name: /menu|navigasi|toggle/i })
            .first();

        await expect(toggle).toBeVisible();
        await toggle.click();

        const jurusanLink = page
            .getByRole('link', { name: /jurusan/i })
            .first();

        await expect(jurusanLink).toBeVisible();
        await jurusanLink.click();

        await page.waitForURL(/\/jurusan/);
        await expect(page.locator('h1')).toHaveCount(1);
    });
});

test.describe('tema gelap', () => {
    test('toggle mengubah kelas dan bertahan setelah reload', async ({
        page,
        viewport,
    }) => {
        await page.goto('/');

        const before = await page.evaluate(() =>
            document.documentElement.classList.contains('dark'),
        );

        // Below the md breakpoint the toggle sits inside the collapsed menu
        // (`hidden md:flex` in header.tsx), so it has to be opened first.
        if ((viewport?.width ?? 0) < 768) {
            await page
                .getByRole('button', { name: /menu|navigasi|toggle/i })
                .first()
                .click();
        }

        const toggle = page
            .getByRole('button', { name: /mode gelap|mode terang/i })
            .first();

        await expect(toggle).toBeVisible();
        await toggle.click();

        await expect
            .poll(() =>
                page.evaluate(() =>
                    document.documentElement.classList.contains('dark'),
                ),
            )
            .toBe(!before);

        // The choice is stored in a cookie that HandleAppearance replays into
        // the blade template, so it must survive a full document load — not
        // just a client-side re-render.
        await page.reload();

        const afterReload = await page.evaluate(() =>
            document.documentElement.classList.contains('dark'),
        );

        expect(afterReload).toBe(!before);
    });
});

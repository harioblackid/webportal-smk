import { expect, test } from '@playwright/test';

import { adminRoutes, storageState, superadminRoutes } from '../routes';

/**
 * CMS flows and, more importantly, the FR5-2 role split.
 *
 * Hiding a button is not authorization. The Editor block below asserts a real
 * 403 status from the server, which is the only thing that actually stops a
 * determined Editor from typing the URL.
 */

test.describe('superadmin', () => {
    test.use({ storageState: storageState.superadmin });

    for (const route of [...adminRoutes, ...superadminRoutes]) {
        test(`membuka ${route.name} (${route.path})`, async ({ page }) => {
            const errors: string[] = [];

            page.on('pageerror', (error) => errors.push(error.message));

            const response = await page.goto(route.path);

            expect(response?.status()).toBe(200);
            await expect(page.locator('h1, h2').first()).toBeVisible();
            expect(errors, 'uncaught JavaScript errors').toEqual([]);
        });
    }

    test('mencari berita mempersempit daftar', async ({ page }) => {
        await page.goto('/admin/posts');

        const search = page.getByPlaceholder(/mis\./i).first();

        await expect(search).toBeVisible();
        await search.fill('Kunjungan');
        await search.press('Enter');

        await page.waitForURL(/q=Kunjungan/);
        await expect(page.locator('body')).toContainText(/Kunjungan/i);
    });

    test('membuat berita baru lewat form', async ({ page }) => {
        // The "Demo" prefix makes the derived slug start with `demo-`, so
        // `php artisan demo:clear` force-deletes it. Deleting through the UI
        // below is a SOFT delete, which hides the row but keeps it (and its
        // slug) in the table forever.
        const title = `Demo Uji Otomatis ${Date.now()}`;

        await page.goto('/admin/posts/create');

        // Not just `getByLabel('Judul')`: the TipTap toolbar has "Judul bagian"
        // and "Sub judul" buttons that match a loose name.
        await page.getByLabel('Judul', { exact: true }).fill(title);
        await page
            .getByLabel('Ringkasan')
            .fill('Ringkasan dari pengujian otomatis Playwright.');

        // The body is a TipTap editor, not a textarea — it has to be typed into
        // as a contenteditable or the form submits with an empty body.
        const editor = page.locator('[contenteditable="true"]').first();

        await expect(editor).toBeVisible();
        await editor.click();
        await editor.fill('Isi berita yang ditulis oleh pengujian otomatis.');

        await page.getByRole('button', { name: 'Simpan' }).click();

        await page.waitForURL(/\/admin\/posts(\?|$)/);

        const row = page.getByRole('button', { name: `Hapus ${title}` });

        await expect(row).toBeVisible();

        // Delete it again. This runs against the developer's real database, so
        // a test that only creates would silently pile up rows on every run —
        // and it gets the FR5-11 confirm-dialog flow covered for free.
        await row.click();
        await page.getByRole('button', { name: 'Ya, hapus' }).click();

        /*
         * Generous timeout on purpose. This is a round trip through a
         * single-threaded `php artisan serve` that the rest of the matrix is
         * also hammering, so the default 5s expires on queueing rather than on
         * anything being wrong.
         *
         * Asserted on the row, not on body text: the success flash quotes the
         * title back, so the page legitimately still mentions it.
         */
        await expect(row).toHaveCount(0, { timeout: 20_000 });
    });

    test('media picker menampilkan pustaka gambar', async ({ page }) => {
        await page.goto('/admin/media');

        // The demo fixture uploads 23 images; an empty grid means the seeder
        // never ran, and every image-dependent assertion downstream is void.
        await expect(page.locator('img').first()).toBeVisible();
        expect(await page.locator('img').count()).toBeGreaterThan(0);
    });
});

test.describe('editor', () => {
    test.use({ storageState: storageState.editor });

    for (const route of adminRoutes) {
        test(`boleh membuka ${route.name}`, async ({ page }) => {
            const response = await page.goto(route.path);

            expect(response?.status()).toBe(200);
        });
    }

    for (const route of superadminRoutes) {
        test(`ditolak 403 di ${route.name} (${route.path})`, async ({
            request,
        }) => {
            const response = await request.get(route.path, {
                maxRedirects: 0,
                failOnStatusCode: false,
            });

            // 403, not 302: a redirect would mean the route merely hid itself,
            // and FR5-15a asks for a refusal.
            expect(response.status()).toBe(403);
        });
    }
});

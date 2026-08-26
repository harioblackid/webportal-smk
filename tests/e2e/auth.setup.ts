import type { Page } from '@playwright/test';
import { expect, test as setup } from '@playwright/test';

import { credentials, storageState } from './routes';

/**
 * Signs in once per role and parks the session, so the admin specs do not spend
 * a login round-trip each. Both roles are needed: proving the FR5-2 split takes
 * an Editor who is genuinely authenticated and still refused.
 */
async function signIn(
    page: Page,
    email: string,
    password: string,
    file: string,
) {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/kata sandi|password/i).fill(password);
    await page.getByRole('button', { name: /masuk|login/i }).click();

    // Landing on /admin is the assertion: a failed login re-renders /login with
    // an error, which would otherwise be saved as a perfectly valid-looking
    // storage state and fail much later in a confusing place.
    await page.waitForURL(/\/admin/);
    await expect(page).toHaveURL(/\/admin/);

    await page.context().storageState({ path: file });
}

setup('authenticate as superadmin', async ({ page }) => {
    await signIn(
        page,
        credentials.superadmin.email,
        credentials.superadmin.password,
        storageState.superadmin,
    );
});

setup('authenticate as editor', async ({ page }) => {
    await signIn(
        page,
        credentials.editor.email,
        credentials.editor.password,
        storageState.editor,
    );
});

/**
 * The route inventory the browser suite walks.
 *
 * Kept in one place because three specs (smoke, responsive, seo) all need the
 * same list, and a page that exists but is missing here is a page nobody tests.
 * Mirrors routes/web.php and routes/admin.php.
 */

import type { APIRequestContext } from '@playwright/test';

export type Route = {
    /** Path to visit, relative to baseURL. */
    path: string;
    /** Used as the test name. */
    name: string;
    /** Text that must be present once the page has rendered. */
    expect?: string;
    /** Expected HTTP status, when it is not 200. */
    status?: number;
};

/** Public pages — the SEO-critical set, and the reason SSR exists. */
export const publicRoutes: Route[] = [
    { path: '/', name: 'beranda', expect: 'SMK PGRI Telagasari' },
    { path: '/profil', name: 'visi misi', expect: 'Profil' },
    // The four toggled pages are on by default, so they belong in the walk.
    // A run against a site with one switched off will see 404 here, which is
    // the correct signal rather than a false pass.
    {
        path: '/profil/identitas',
        name: 'identitas sekolah',
        expect: 'Identitas',
    },
    {
        path: '/profil/spektrum-kurikulum',
        name: 'spektrum kurikulum',
        expect: 'Spektrum',
    },
    { path: '/galeri', name: 'galeri index', expect: 'Galeri' },
    {
        path: '/ekstrakurikuler',
        name: 'ekstrakurikuler',
        expect: 'Ekstrakurikuler',
    },
    { path: '/kontak', name: 'kontak', expect: 'Kontak' },
    { path: '/berita', name: 'berita index', expect: 'Berita' },
    { path: '/berita?page=2', name: 'berita halaman 2', expect: 'Berita' },
    { path: '/jurusan', name: 'jurusan index', expect: 'Jurusan' },
];

/**
 * Detail pages depend on seeded slugs, so they are resolved at runtime from the
 * listing pages rather than hard-coded — a fixture rename must not silently
 * turn these into 404 tests that still pass.
 */
export const detailSources = {
    berita: '/berita',
    jurusan: '/jurusan',
};

/** Pages that must NOT return 200 (FR6-21). */
export const notFoundRoutes: Route[] = [
    { path: '/halaman-yang-tidak-ada', name: '404 fallback', status: 404 },
];

/** Non-Inertia responses: XML and plain text, excluded from page-level checks. */
export const documentRoutes: Route[] = [
    { path: '/sitemap.xml', name: 'sitemap.xml' },
    { path: '/robots.txt', name: 'robots.txt' },
];

/** Admin pages any authenticated CMS user may open. */
export const adminRoutes: Route[] = [
    { path: '/admin', name: 'dashboard' },
    { path: '/admin/posts', name: 'daftar berita' },
    { path: '/admin/posts/create', name: 'buat berita' },
    { path: '/admin/categories', name: 'kategori' },
    { path: '/admin/heroes', name: 'daftar hero' },
    { path: '/admin/heroes/create', name: 'buat hero' },
    { path: '/admin/media', name: 'media' },
    { path: '/admin/profile-sections', name: 'halaman visi misi' },
    { path: '/admin/curriculum-spectra', name: 'daftar spektrum' },
    { path: '/admin/curriculum-spectra/create', name: 'buat spektrum' },
    { path: '/admin/gallery-albums', name: 'daftar album galeri' },
    { path: '/admin/gallery-albums/create', name: 'buat album galeri' },
    { path: '/admin/extracurriculars', name: 'daftar ekstrakurikuler' },
    { path: '/admin/extracurriculars/create', name: 'buat ekstrakurikuler' },
];

/**
 * Superadmin-only. An Editor hitting these must receive 403, not a redirect and
 * not a rendered page with the buttons hidden (FR5-2, FR5-15a).
 */
export const superadminRoutes: Route[] = [
    { path: '/admin/majors', name: 'daftar jurusan' },
    { path: '/admin/majors/create', name: 'buat jurusan' },
    { path: '/admin/school-identity', name: 'identitas sekolah' },
    { path: '/admin/settings', name: 'pengaturan' },
    { path: '/admin/users', name: 'daftar pengguna' },
    { path: '/admin/users/create', name: 'buat pengguna' },
];

/** Must match the constants in database/seeders/DatabaseSeeder.php. */
export const credentials = {
    superadmin: { email: 'admin@smk.com', password: 'adminsmk99' },
    editor: { email: 'editor@smk.com', password: 'adminsmk99' },
};

/** Where auth.setup.ts parks the signed-in browser state. */
export const storageState = {
    superadmin: 'tests/e2e/.auth/superadmin.json',
    editor: 'tests/e2e/.auth/editor.json',
};

/*
 * Content probes.
 *
 * The seeders create accounts, jurusan, ekstrakurikuler, the identity record,
 * and the site settings — no berita, no media, no hero. Specs that assert on
 * content ask one of these first and skip themselves when the answer is empty,
 * so the assertions stay in the repo and start covering FR6-12, FR6-9, and
 * FR6-14 again the moment they run against a database that has content.
 *
 * Both read raw HTML rather than the rendered DOM: they have to work before a
 * page object exists, and unauthenticated.
 */

/**
 * Category chips live under /berita/ too, so they are excluded by href rather
 * than by link text.
 */
const BERITA_DETAIL =
    /href="(?:https?:\/\/[^"]*)?(\/berita\/(?!kategori\/)[a-z0-9-]+)"/;

/** The path of the first berita on the listing, or null when there are none. */
export async function firstBeritaPath(
    request: APIRequestContext,
): Promise<string | null> {
    const listing = await (await request.get('/berita')).text();
    const match = listing.match(BERITA_DETAIL);

    return match === null ? null : match[1];
}

/** Whether the home page references any uploaded media at all. */
export async function hasPublishedMedia(
    request: APIRequestContext,
): Promise<boolean> {
    const home = await (await request.get('/')).text();

    return home.includes('/storage/media/');
}

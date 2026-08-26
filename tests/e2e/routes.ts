/**
 * The route inventory the browser suite walks.
 *
 * Kept in one place because three specs (smoke, responsive, seo) all need the
 * same list, and a page that exists but is missing here is a page nobody tests.
 * Mirrors routes/web.php and routes/admin.php.
 */

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
    { path: '/profil', name: 'profil', expect: 'Profil' },
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
];

/**
 * Superadmin-only. An Editor hitting these must receive 403, not a redirect and
 * not a rendered page with the buttons hidden (FR5-2, FR5-15a).
 */
export const superadminRoutes: Route[] = [
    { path: '/admin/majors', name: 'daftar jurusan' },
    { path: '/admin/majors/create', name: 'buat jurusan' },
    { path: '/admin/settings', name: 'pengaturan' },
    { path: '/admin/users', name: 'daftar pengguna' },
    { path: '/admin/users/create', name: 'buat pengguna' },
];

export const credentials = {
    superadmin: { email: 'superadmin@demo.test', password: 'password' },
    editor: { email: 'editor@demo.test', password: 'password' },
};

/** Where auth.setup.ts parks the signed-in browser state. */
export const storageState = {
    superadmin: 'tests/e2e/.auth/superadmin.json',
    editor: 'tests/e2e/.auth/editor.json',
};

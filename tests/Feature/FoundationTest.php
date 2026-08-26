<?php

use Inertia\Testing\AssertableInertia;

test('home renders the public home page component', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('public/home'));
});

test('the document declares Indonesian as its language', function () {
    // FR6-22: <html lang="id">, driven by the app locale.
    $this->get(route('home'))->assertSee('<html lang="id">', false);
});

test('the SSR entrypoint exists and is the configured bundle target', function () {
    // B-1 in prd/notes.md: inertia.ssr.enabled was true with no entrypoint at
    // all, so every page silently fell back to client rendering. The mismatch
    // was the bug, so entrypoint and bundle target are what this pins.
    //
    // `enabled` is deliberately not asserted here: the suite sets
    // INERTIA_SSR_ENABLED=false so it does not dial a dead port on every
    // response. That SSR actually renders is proven against a live server by
    // tests/Feature/Public/SsrTest.php and tests/e2e/seo.spec.ts.
    expect(resource_path('js/ssr.tsx'))->toBeFile()
        ->and(config('inertia.ssr.bundle'))->toBe(base_path('bootstrap/ssr/ssr.js'));
});

test('both design systems stay declared in the stylesheet', function () {
    // The stylesheet carries two themes side by side: AstroWind for the public
    // site and the Laravel starter kit's shadcn/ui tokens for /admin. Pinned
    // here so an edit to one cannot quietly drop the other.
    // Comments are stripped first — they name both systems in prose. The
    // lookbehind keeps the `/*` inside the @source globs from opening one.
    $css = preg_replace(
        '#(?<![\w/])/\*.*?\*/#s',
        '',
        file_get_contents(resource_path('css/app.css'))
    );

    expect($css)
        // AstroWind: the palette variables and the btn utilities.
        ->toContain('--aw-color-primary')
        ->toContain('rgb(1 97 239)')
        ->toContain('@utility btn-primary')
        // shadcn/ui: the token bridge and the sidebar scale the CMS shell needs.
        ->toContain('--color-background: var(--background)')
        ->toContain('--color-sidebar: var(--sidebar)')
        ->toContain('Instrument Sans')
        // Dark mode is class-driven, matching hooks/use-appearance.tsx.
        ->toContain('@custom-variant dark');
});

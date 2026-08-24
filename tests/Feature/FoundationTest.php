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
    // all, so every page silently fell back to client rendering.
    expect(resource_path('js/ssr.tsx'))->toBeFile()
        ->and(config('inertia.ssr.enabled'))->toBeTrue()
        ->and(config('inertia.ssr.bundle'))->toBe(base_path('bootstrap/ssr/ssr.js'));
});

test('no forbidden font or colour reaches the stylesheet', function () {
    // prd-03 §7 self-audit, pinned so a later edit cannot quietly undo it.
    // Comments are stripped first — they quote the forbidden list verbatim.
    $css = preg_replace('#/\*.*?\*/#s', '', file_get_contents(resource_path('css/app.css')));

    expect($css)
        ->not->toContain('Instrument Sans')
        ->not->toContain('system-ui')
        ->not->toContain('Helvetica')
        ->not->toContain('Arial')
        ->and($css)->toContain('#3f7d20')
        ->and($css)->toContain('#72b01d');
});

<?php

use App\Models\Hero;
use App\Models\Media;
use Illuminate\Support\Facades\Vite;

const SSR_ABSENT = 'SSR process not running — start it with `php artisan inertia:start-ssr`.';

/**
 * FR6-1 — public pages must be server-rendered, "lolos uji View Source".
 *
 * Every other test in the suite asserts Inertia PROPS, which are identical
 * whether the page was server-rendered or not. That is the gap this file
 * closes: Inertia falls back to client rendering silently — same 200, same
 * props, no warning — so without an assertion on the response BODY, SSR can
 * break and the whole suite stays green.
 *
 * Requires a live SSR process (`php artisan inertia:start-ssr`); skipped when
 * there is none, so it never turns a normal `php artisan test` red.
 */
function ssrIsListening(): bool
{
    $url = (string) config('inertia.ssr.url');
    $parts = parse_url($url);

    if (! is_array($parts) || ! isset($parts['host'], $parts['port'])) {
        return false;
    }

    $socket = @fsockopen((string) $parts['host'], (int) $parts['port'], $code, $message, 0.5);

    if ($socket === false) {
        return false;
    }

    fclose($socket);

    return true;
}

beforeEach(function () {
    // The suite disables SSR wholesale (see phpunit.xml); this file is the one
    // place that wants it on.
    config()->set('inertia.ssr.enabled', true);
});

it('server-renders the home page into the initial HTML', function () {
    $hero = Hero::factory()->create([
        'title' => 'Belajar kejuruan, siap melangkah',
        'is_active' => true,
        'media_id' => Media::factory()->create()->id,
    ]);

    $body = $this->get('/')->assertOk()->getContent();

    expect($body)
        // The tell-tale of a CSR fallback: Inertia ships the mount point empty
        // and lets the browser fill it, which is exactly what FR6-1 forbids.
        ->not->toContain('<div id="app"></div>')
        ->toContain($hero->title);
})->skip(fn () => ! ssrIsListening(), SSR_ABSENT);

it('puts the per-page metadata in the initial HTML, not just in the props', function () {
    Hero::factory()->create(['is_active' => true, 'media_id' => Media::factory()->create()->id]);

    $body = $this->get('/')->assertOk()->getContent();

    // FR6-3/FR6-4/FR6-5. These come from the React <Head> tree, so they exist
    // in View Source only when SSR ran — a crawler sees nothing otherwise.
    expect($body)
        ->toContain('<link rel="canonical"')
        ->toContain('name="description"')
        ->toContain('property="og:title"')
        // The blade <title> is a fallback used only when SSR returns nothing.
        ->not->toContain('<title>'.config('app.name').'</title>');
})->skip(fn () => ! ssrIsListening(), SSR_ABSENT);

it('does not treat a leftover vite hot file as a running dev server', function () {
    // A stale public/hot (left behind when `npm run dev` is killed) makes
    // Vite::isRunningHot() true, so Inertia posts the page to the Vite hot
    // endpoint instead of the SSR port. Nothing answers, and every public page
    // silently degrades to CSR while looking completely healthy.
    expect(Vite::isRunningHot())->toBeFalse();
})->skip(fn () => ! ssrIsListening(), SSR_ABSENT);

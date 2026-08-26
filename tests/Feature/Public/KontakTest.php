<?php

use App\Models\SchoolIdentity;
use App\Models\Setting;
use App\Support\SiteSettings;
use Inertia\Testing\AssertableInertia;

// FR4-17 — lokasi peta: titik koordinat atau link Google Maps.

test('link mode is the default and keeps the existing behaviour', function () {
    Setting::put('maps_embed', 'https://www.google.com/maps/embed?pb=1');

    expect(SiteSettings::mapsMode())->toBe('link');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('mapsEmbedUrl', 'https://www.google.com/maps/embed?pb=1'));
});

test('coordinate mode builds the map from the identity record', function () {
    Setting::put('maps_mode', 'coordinates');
    SchoolIdentity::put('lintang', '-6.284712');
    SchoolIdentity::put('bujur', '107.406319');

    $this->get(route('kontak'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where(
                'mapsEmbedUrl',
                'https://maps.google.com/maps?q=-6.284712,107.406319&hl=id&z=16&output=embed',
            ));
});

test('coordinate mode ignores whatever the link field still holds', function () {
    // Switching mode must not resurrect a stale embed the school moved away
    // from — the mode decides, not whichever field happens to be filled.
    Setting::put('maps_mode', 'coordinates');
    Setting::put('maps_embed', 'https://www.google.com/maps/embed?pb=1');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('mapsEmbedUrl', null));
});

test('coordinate mode renders no map when the coordinates are incomplete', function () {
    Setting::put('maps_mode', 'coordinates');
    SchoolIdentity::put('lintang', '-6.284712');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('mapsEmbedUrl', null));
});

test('coordinate mode rejects a value that is not a number', function () {
    Setting::put('maps_mode', 'coordinates');
    SchoolIdentity::put('lintang', 'sebelah masjid');
    SchoolIdentity::put('bujur', '107.406319');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('mapsEmbedUrl', null));
});

test('an unknown stored mode falls back to link rather than breaking', function () {
    Setting::put('maps_mode', 'entah');

    expect(SiteSettings::mapsMode())->toBe('link');
});

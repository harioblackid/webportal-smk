<?php

use App\Support\MapsEmbed;

// FR4-17 — a pasted map link has to be framable, not merely https.
//
// Production ran with a Google share URL in `maps_embed`: it passed the old
// "starts with https://" check, Google answered X-Frame-Options: SAMEORIGIN,
// and the Kontak page showed an empty box with nothing in the logs.

test('a share link is rewritten to the embeddable form', function () {
    $shared = 'https://www.google.com/maps/place/SMK+PGRI+Telagasari/'
        .'@-6.2897709,107.3896644,18.26z/data=!4m6!3m5'
        .'!1s0x2e6970ae0bf0fd93:0xb54538bbe394e8b9'
        .'!8m2!3d-6.2897689!4d107.3909987!16s%2Fg%2F1hm49hdmf?entry=ttu';

    // The !3d/!4d pin wins over the @ viewport centre: the first is the place,
    // the second is wherever the sharer's screen happened to be.
    expect(MapsEmbed::normalize($shared))->toBe(
        'https://maps.google.com/maps?q=-6.2897689,107.3909987&hl=id&z=16&output=embed',
    );
});

test('a viewport centre is used when the URL carries no place pin', function () {
    expect(MapsEmbed::normalize('https://www.google.com/maps/@-6.1,107.2,17z'))
        ->toBe('https://maps.google.com/maps?q=-6.1,107.2&hl=id&z=16&output=embed');
});

test('an embed URL from Google is left exactly as it is', function () {
    expect(MapsEmbed::normalize('https://www.google.com/maps/embed?pb=1'))
        ->toBe('https://www.google.com/maps/embed?pb=1');
});

test('a value that already asks for embed output is left alone', function () {
    $url = 'https://maps.google.com/maps?q=-6.28,107.40&hl=id&z=16&output=embed';

    expect(MapsEmbed::normalize($url))->toBe($url);
});

test('a pasted iframe is reduced to its src and unescaped', function () {
    $snippet = '<iframe src="https://www.google.com/maps/embed?pb=1&amp;z=15" '
        .'width="600" height="450" loading="lazy"></iframe>';

    expect(MapsEmbed::normalize($snippet))
        ->toBe('https://www.google.com/maps/embed?pb=1&z=15');
});

test('a place name with no coordinate still resolves to a map', function () {
    expect(MapsEmbed::normalize('https://www.google.com/maps?q=SMK+PGRI+Telagasari'))
        ->toBe('https://maps.google.com/maps?q=SMK%20PGRI%20Telagasari&hl=id&z=16&output=embed');
});

test('a country domain is accepted like google.com', function () {
    expect(MapsEmbed::normalize('https://www.google.co.id/maps/@-6.1,107.2,17z'))
        ->toBe('https://maps.google.com/maps?q=-6.1,107.2&hl=id&z=16&output=embed');
});

test('a coordinate pair is built without escaping its comma', function () {
    // An escaped comma turns the point into a place name Google has to look up.
    expect(MapsEmbed::fromCoordinates('-6.284712', '107.406319'))
        ->toBe('https://maps.google.com/maps?q=-6.284712,107.406319&hl=id&z=16&output=embed');
});

test('a value that cannot become a map resolves to null', function (?string $value) {
    expect(MapsEmbed::normalize($value))->toBeNull();
})->with([
    'empty' => '',
    'whitespace' => '   ',
    'null' => null,
    // No coordinate travels in a short link, and resolving one would need a
    // network round trip from a request that is rendering a page.
    'short link' => 'https://maps.app.goo.gl/abc123',
    'plain http' => 'http://www.google.com/maps/embed?pb=1',
    // Framing an arbitrary host is how an unrelated page ends up inside the
    // Kontak page.
    'another host' => 'https://evil.example.com/maps/embed?pb=1',
    'lookalike host' => 'https://google.com.attacker.test/maps/embed?pb=1',
    'not a URL' => 'sebelah masjid',
]);

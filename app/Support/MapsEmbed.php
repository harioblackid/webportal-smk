<?php

namespace App\Support;

/**
 * FR4-17 — turns whatever the school pasted into a URL an `<iframe>` can show.
 *
 * Google serves two kinds of Maps URL and only one of them may be framed. The
 * share sheet hands out `/maps/place/…`, which answers
 * `X-Frame-Options: SAMEORIGIN`; pasted into the CMS it passed the old
 * "starts with https://" check and left the public Kontak page with a blank
 * box — the page looked healthy and the map simply never appeared.
 *
 * So a link is normalised here rather than merely checked. A share URL that
 * carries a coordinate is rewritten to the embed form, which is why an already
 * stored bad paste heals on the next request instead of waiting for someone to
 * edit the setting. Anything that cannot be rewritten resolves to null, and
 * SettingRequest refuses it at the form so the failure is visible where it can
 * still be fixed.
 */
class MapsEmbed
{
    /**
     * The place pin inside a share URL's `data=` blob: `!3d<lat>!4d<lng>`.
     *
     * Preferred over the `@lat,lng` in the path, which is only the centre of
     * the viewport the sharer happened to have open.
     */
    private const PLACE_PIN = '/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/';

    /** The viewport centre: `/@<lat>,<lng>,<zoom>z`. */
    private const VIEWPORT = '/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/';

    /** A bare `q=<lat>,<lng>` pair, which older share links still use. */
    private const QUERY_PAIR = '/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/';

    /**
     * The embeddable form of a pasted map link, or null when there is none.
     *
     * Accepts the whole `<iframe>` snippet as well as a bare URL: only the src
     * is ever kept, so pasted markup cannot become script on the public site.
     */
    public static function normalize(?string $raw): ?string
    {
        $value = trim((string) $raw);

        if ($value === '') {
            return null;
        }

        if (preg_match('/src\s*=\s*["\']([^"\']+)["\']/i', $value, $matches) === 1) {
            $value = $matches[1];
        }

        // A pasted iframe arrives HTML-escaped, so `&amp;` has to come back to
        // `&` before the query string can be read.
        $value = html_entity_decode(trim($value), ENT_QUOTES | ENT_HTML5);

        if (! str_starts_with($value, 'https://')) {
            return null;
        }

        $host = parse_url($value, PHP_URL_HOST);
        $path = parse_url($value, PHP_URL_PATH);

        if (! is_string($host) || ! self::isGoogleMaps($host)) {
            return null;
        }

        // `/maps/embed?pb=…` is what Google's own "Sematkan peta" tab gives
        // out; it is already framable and must survive untouched.
        if (is_string($path) && str_starts_with($path, '/maps/embed')) {
            return $value;
        }

        $query = parse_url($value, PHP_URL_QUERY);
        $params = [];

        if (is_string($query)) {
            parse_str($query, $params);
        }

        if (($params['output'] ?? null) === 'embed') {
            return $value;
        }

        $point = self::point($value, $params);

        if ($point !== null) {
            return self::fromCoordinates($point[0], $point[1]);
        }

        // No coordinate anywhere: a place name is still enough for Google to
        // find the pin, but a short link (maps.app.goo.gl) carries neither and
        // would need a network round trip to resolve.
        $place = $params['q'] ?? null;

        if (is_string($place) && trim($place) !== '') {
            return self::search(trim($place));
        }

        return null;
    }

    /** The embed URL for a point the school pinned itself. */
    public static function fromCoordinates(string $lat, string $lng): string
    {
        // Left unencoded: Google reads the pair as a point only while the
        // comma is a comma, and an escaped one is treated as a place name.
        return self::embed($lat.','.$lng);
    }

    /** A place name Google has to look up rather than a point it can plot. */
    private static function search(string $place): string
    {
        return self::embed(rawurlencode($place));
    }

    private static function embed(string $query): string
    {
        return 'https://maps.google.com/maps?q='.$query.'&hl=id&z=16&output=embed';
    }

    /**
     * The best coordinate the URL carries, most precise source first.
     *
     * @param  array<mixed>  $params
     * @return array{0: string, 1: string}|null
     */
    private static function point(string $url, array $params): ?array
    {
        foreach ([self::PLACE_PIN, self::VIEWPORT] as $pattern) {
            if (preg_match($pattern, $url, $matches) === 1) {
                return [$matches[1], $matches[2]];
            }
        }

        $q = $params['q'] ?? null;

        if (is_string($q) && preg_match(self::QUERY_PAIR, $q, $matches) === 1) {
            return [$matches[1], $matches[2]];
        }

        return null;
    }

    /**
     * Google's Maps hosts — every country domain, but nothing else.
     *
     * A URL on another host is not a map, and framing it is how an unrelated
     * page would end up embedded in the Kontak page.
     */
    private static function isGoogleMaps(string $host): bool
    {
        return preg_match('/(^|\.)google\.(com|[a-z]{2}|com?\.[a-z]{2})$/i', $host) === 1;
    }
}

<?php

namespace App\Support;

use App\Http\Resources\ImageResource;
use App\Models\Media;
use App\Models\Setting;
use Inertia\Inertia;

/**
 * Reads the FR7-7 settings keys into the shape the public pages consume.
 *
 * Deliberately uncached: FR5-19 says a Setting change must show on the public
 * site immediately, and this is one indexed key-value read per request.
 */
class SiteSettings
{
    /**
     * The identity, contact, and PPDB values every public page needs.
     *
     * @return array<string, mixed>
     */
    public static function share(): array
    {
        $values = Setting::query()->pluck('value', 'key');
        // Name, address, phone, and email live in `school_id` — the identity
        // record — not in site settings, so the two can never disagree.
        $identity = SchoolIdentityFields::all();

        $phone = $identity['nomor_telepon'] ?? null;
        $whatsapp = self::clean($values->get('contact_whatsapp'));
        $ppdbUrl = self::clean($values->get('ppdb_url'));
        $base = self::baseUrl();

        $site = [
            'name' => $identity['nama_sekolah'] ?? config('app.name'),
            'tagline' => self::clean($values->get('tagline')),
            'url' => $base,
            // D-4: derived from the school crest and served from public/ at a
            // stable path, so PHP can name it in JSON-LD and og:image while
            // React points at the same file.
            'logo' => self::mediaUrl($values->get('logo_media_id')) ?? $base.'/logo-smk.png',
            // FR6-19: what a share falls back to when a page has no image.
            'ogImage' => $base.'/og-default.png',
            'contact' => [
                'address' => $identity['alamat'] ?? null,
                'phone' => $phone,
                'phoneHref' => $phone === null ? null : 'tel:'.self::digits($phone),
                'whatsapp' => $whatsapp,
                'whatsappHref' => $whatsapp === null ? null : 'https://wa.me/'.self::msisdn($whatsapp),
                'email' => $identity['email'] ?? null,
            ],
            'ppdb' => [
                // FR4-14: the banner is opt-in, and a banner without a target
                // is worse than no banner at all.
                'enabled' => filter_var($values->get('ppdb_enabled'), FILTER_VALIDATE_BOOLEAN)
                    && $ppdbUrl !== null,
                'url' => $ppdbUrl,
                'image' => ImageResource::optional(
                    Media::query()
                        ->whereKey($values->get('ppdb_banner_media_id'))
                        ->first()
                ),
            ],
        ];

        // FR6-11: built here so the JSON-LD and the visible contact block can
        // never drift apart — both read the same array.
        $site['organization'] = StructuredData::organization($site);

        return $site;
    }

    /**
     * The array HandleInertiaRequests already shared this request.
     *
     * Lets a controller reuse the identity block without a second round of
     * queries, and guarantees JSON-LD and the visible page cannot disagree.
     *
     * @return array<string, mixed>
     */
    public static function shared(): array
    {
        $site = Inertia::getShared('site');

        return is_array($site) ? $site : self::share();
    }

    /**
     * FR6-4 — the canonical host, never the host the request arrived on.
     *
     * A crawler that reaches an alias must still be handed one set of URLs,
     * so every absolute URL on the page is built from this.
     */
    public static function baseUrl(): string
    {
        return rtrim((string) config('app.url'), '/');
    }

    /** The uploaded logo wins over the bundled one once the CMS has one. */
    private static function mediaUrl(mixed $mediaId): ?string
    {
        return Media::query()->whereKey($mediaId)->first()?->url();
    }

    /**
     * The Google Maps embed for FR4-17.
     *
     * The setting may hold either a bare URL or the whole `<iframe>` snippet
     * Google hands out. Only the src is kept — pasted markup is never injected
     * into the page, so a bad paste cannot become script on the public site.
     */
    public static function mapsEmbedUrl(): ?string
    {
        $value = self::clean(Setting::get('maps_embed'));

        if ($value === null) {
            return null;
        }

        if (preg_match('/src\s*=\s*["\']([^"\']+)["\']/i', $value, $matches) === 1) {
            $value = $matches[1];
        }

        return str_starts_with($value, 'https://') ? $value : null;
    }

    private static function clean(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private static function digits(string $value): string
    {
        return (string) preg_replace('/\D+/', '', $value);
    }

    /** Indonesian numbers are stored as 08xx locally but wa.me wants 628xx. */
    private static function msisdn(string $value): string
    {
        $digits = self::digits($value);

        return str_starts_with($digits, '0') ? '62'.substr($digits, 1) : $digits;
    }
}

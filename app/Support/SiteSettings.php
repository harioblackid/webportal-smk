<?php

namespace App\Support;

use App\Http\Resources\ImageResource;
use App\Models\Media;
use App\Models\Setting;

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

        $phone = self::clean($values->get('contact_phone'));
        $whatsapp = self::clean($values->get('contact_whatsapp'));
        $ppdbUrl = self::clean($values->get('ppdb_url'));

        return [
            'name' => self::clean($values->get('school_name')) ?? config('app.name'),
            'tagline' => self::clean($values->get('tagline')),
            'url' => rtrim((string) config('app.url'), '/'),
            'contact' => [
                'address' => self::clean($values->get('contact_address')),
                'phone' => $phone,
                'phoneHref' => $phone === null ? null : 'tel:'.self::digits($phone),
                'whatsapp' => $whatsapp,
                'whatsappHref' => $whatsapp === null ? null : 'https://wa.me/'.self::msisdn($whatsapp),
                'email' => self::clean($values->get('contact_email')),
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

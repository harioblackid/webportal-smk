<?php

namespace App\Http\Requests\Admin;

use App\Support\MapsEmbed;
use App\Support\SearchConsole;
use App\Support\SiteSettings;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * FR5-18 — identitas, kontak, banner PPDB, GA4, dan Search Console.
 *
 * The keys here are the same ones App\Support\SiteSettings reads, so the form
 * and the public site cannot drift apart.
 */
class SettingRequest extends FormRequest
{
    /**
     * The Search Console screen copies the whole `<meta …>` tag, so the token
     * is pulled out of it before the rules run — an admin who pastes what
     * Google gave them should not have to edit it down by hand.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('search_console_verification')) {
            $this->merge([
                'search_console_verification' => SearchConsole::extract(
                    $this->string('search_console_verification')->toString()
                ),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'tagline' => ['nullable', 'string', 'max:200'],
            'logo_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'contact_whatsapp' => ['nullable', 'string', 'max:40'],
            'maps_mode' => ['required', 'string', Rule::in(SiteSettings::MAPS_MODES)],
            // Still optional: the Kontak page treats "no map yet" as a normal
            // state, and in coordinates mode this field is not used at all.
            // What is filled in has to be framable, though — a Google share
            // link answers X-Frame-Options and would leave the public page
            // with a blank box that looks like nothing is wrong.
            'maps_embed' => ['nullable', 'string', 'max:2000', $this->embeddableMap()],
            'ppdb_enabled' => ['boolean'],
            // FR4-14 only shows the banner when it has somewhere to go, so a
            // switched-on banner must carry a URL.
            'ppdb_url' => ['nullable', 'required_if:ppdb_enabled,true', 'url', 'max:255'],
            'ppdb_banner_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'ga4_measurement_id' => ['nullable', 'string', 'regex:/^G-[A-Z0-9]{4,20}$/'],
            // prepareForValidation() has already reduced a pasted meta tag to
            // its token, so anything still malformed arrived as garbage.
            'search_console_verification' => ['nullable', 'string', 'regex:/^[A-Za-z0-9_-]{20,128}$/'],
        ];
    }

    /**
     * Rejects a map link MapsEmbed cannot turn into an embeddable URL.
     *
     * Only in `link` mode: coordinates mode ignores this field entirely, so
     * failing it there would block a save over a value nobody can see.
     */
    private function embeddableMap(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($this->string('maps_mode')->toString() !== 'link') {
                return;
            }

            if (! is_string($value) || trim($value) === '') {
                return;
            }

            if (MapsEmbed::normalize($value) === null) {
                $fail('Tautan peta tidak bisa disematkan. Salin dari Google Maps › Bagikan › Sematkan peta, atau gunakan tautan yang memuat koordinat.');
            }
        };
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'tagline' => 'tagline',
            'logo_media_id' => 'logo',
            'contact_whatsapp' => 'WhatsApp',
            'maps_mode' => 'mode peta',
            'maps_embed' => 'peta',
            'ppdb_url' => 'URL PPDB',
            'ppdb_banner_media_id' => 'gambar banner PPDB',
            'ga4_measurement_id' => 'Measurement ID GA4',
            'search_console_verification' => 'kode verifikasi Search Console',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ga4_measurement_id.regex' => 'Measurement ID GA4 berbentuk G-XXXXXXXXXX.',
            'search_console_verification.regex' => 'Tempel kode atau tag <meta> verifikasi dari Google Search Console.',
        ];
    }
}

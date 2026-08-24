<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * FR5-18 — identitas, kontak, banner PPDB, dan GA4.
 *
 * The keys here are the same ones App\Support\SiteSettings reads, so the form
 * and the public site cannot drift apart.
 */
class SettingRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'school_name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:200'],
            'logo_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'contact_address' => ['nullable', 'string', 'max:300'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
            'contact_whatsapp' => ['nullable', 'string', 'max:40'],
            'contact_email' => ['nullable', 'email', 'max:120'],
            'maps_embed' => ['nullable', 'string', 'max:2000'],
            'ppdb_enabled' => ['boolean'],
            // FR4-14 only shows the banner when it has somewhere to go, so a
            // switched-on banner must carry a URL.
            'ppdb_url' => ['nullable', 'required_if:ppdb_enabled,true', 'url', 'max:255'],
            'ppdb_banner_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'ga4_measurement_id' => ['nullable', 'string', 'regex:/^G-[A-Z0-9]{4,20}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'school_name' => 'nama sekolah',
            'tagline' => 'tagline',
            'logo_media_id' => 'logo',
            'contact_address' => 'alamat',
            'contact_phone' => 'telepon',
            'contact_whatsapp' => 'WhatsApp',
            'contact_email' => 'email',
            'maps_embed' => 'peta',
            'ppdb_url' => 'URL PPDB',
            'ppdb_banner_media_id' => 'gambar banner PPDB',
            'ga4_measurement_id' => 'Measurement ID GA4',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ga4_measurement_id.regex' => 'Measurement ID GA4 berbentuk G-XXXXXXXXXX.',
        ];
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingRequest;
use App\Models\Setting;
use App\Support\MediaLibrary;
use App\Support\SiteSettings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pengaturan situs (prd-05 §3.7) — Superadmin only, gated by the route group.
 *
 * The keys written here are the ones App\Support\SiteSettings and
 * App\Support\Analytics read on every public request, which is what makes
 * FR5-19 true without a deploy or a cache flush.
 */
class SettingController extends Controller
{
    /**
     * Every key the form owns. Listed once so edit() and update() cannot fall
     * out of step, and so a stray request field can never become a setting.
     *
     * @var list<string>
     */
    private const KEYS = [
        'tagline',
        'logo_media_id',
        'contact_whatsapp',
        'maps_mode',
        'maps_embed',
        'ppdb_enabled',
        'ppdb_url',
        'ppdb_banner_media_id',
        'ga4_measurement_id',
        'search_console_verification',
    ];

    public function edit(): Response
    {
        $values = Setting::query()->pluck('value', 'key');

        return Inertia::render('admin/settings/edit', [
            'settings' => [
                'tagline' => $values->get('tagline') ?? '',
                'logo_media_id' => self::intOrNull($values->get('logo_media_id')),
                'contact_whatsapp' => $values->get('contact_whatsapp') ?? '',
                'maps_mode' => SiteSettings::mapsMode(),
                'maps_embed' => $values->get('maps_embed') ?? '',
                'ppdb_enabled' => filter_var($values->get('ppdb_enabled'), FILTER_VALIDATE_BOOLEAN),
                'ppdb_url' => $values->get('ppdb_url') ?? '',
                'ppdb_banner_media_id' => self::intOrNull($values->get('ppdb_banner_media_id')),
                'ga4_measurement_id' => $values->get('ga4_measurement_id') ?? '',
                'search_console_verification' => $values->get('search_console_verification') ?? '',
            ],
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function update(SettingRequest $request): RedirectResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        foreach (self::KEYS as $key) {
            $value = $data[$key] ?? null;

            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::put($key, self::normalise($value));
        }

        return to_route('admin.settings.edit')
            ->with('success', 'Pengaturan situs disimpan.');
    }

    /**
     * Blank fields are stored as NULL, not as '', so SiteSettings' fallbacks
     * (the bundled logo, config('app.name')) still apply after a field is
     * cleared.
     */
    private static function normalise(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private static function intOrNull(mixed $value): ?int
    {
        return $value === null || $value === '' ? null : (int) $value;
    }
}

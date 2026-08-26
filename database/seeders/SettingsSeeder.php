<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Support\PageVisibility;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Starting values for the `settings` table, which the migrations create empty.
 *
 * Only the keys with a defensible default are written. The rest — logo,
 * maps_embed, ppdb_url, the PPDB banner, GA4, and the Search Console token —
 * are deliberately left unset: SiteSettings already falls back to the bundled
 * crest and config('app.name'), and the two analytics keys are pasted in from
 * the CMS following docs/seo-search-console.md.
 */
class SettingsSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * PageVisibility::all() already defaults an unset page to on. Writing the
     * four rows anyway makes the toggles visible in the admin form as stored
     * state rather than as an implicit default nobody can see.
     */
    private const PAGES_ENABLED = '1';

    /**
     * @var array<string, string>
     */
    private const SETTINGS = [
        'tagline' => 'Terampil, Mandiri, Siap Kerja',
        // FR4-17. `link` rather than `coordinates` because that is what
        // SiteSettings::mapsMode() already returns for an unset key — seeding
        // it writes the existing behaviour down instead of quietly changing it.
        // Neither mode draws a map until the school supplies an embed URL or
        // the lintang/bujur pair on the identity record.
        'maps_mode' => 'link',
        // FR4-14: SiteSettings refuses to show the banner without a target
        // anyway, so off is the honest starting state rather than a placeholder
        // link nobody has set.
        'ppdb_enabled' => '0',
    ];

    /**
     * Insert-if-absent, never update — the release script seeds on every
     * deploy, so writing unconditionally would undo the school's own settings
     * each time a release goes out.
     */
    public function run(): void
    {
        $defaults = self::SETTINGS;

        foreach (PageVisibility::PAGES as $page) {
            $defaults[PageVisibility::key($page)] = self::PAGES_ENABLED;
        }

        foreach ($defaults as $key => $value) {
            Setting::query()->firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}

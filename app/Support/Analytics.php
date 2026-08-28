<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Request;

/**
 * FR5-18 / US-015 — the GA4 Measurement ID is a Setting, so the school can
 * change it without a deploy.
 *
 * The admin area is excluded on purpose: FR5-5 keeps /admin out of the index,
 * and staff editing sessions are not site traffic.
 */
class Analytics
{
    /**
     * The paths that are neither indexed nor measured.
     *
     * SitemapController::robots() disallows exactly this list, so a page
     * cannot end up out of the index but still counted as visitor traffic —
     * which is what was happening on /login.
     *
     * @var list<string>
     */
    public const PRIVATE_PATHS = [
        'admin',
        'login',
        'forgot-password',
        'reset-password',
    ];

    public static function measurementId(): ?string
    {
        if (Request::is(...self::patterns())) {
            return null;
        }

        $id = trim((string) Setting::get('ga4_measurement_id'));

        // The tag only ever accepts G-XXXXXXX; refusing anything else means a
        // fat-fingered value cannot inject markup into every public page.
        return preg_match('/^G-[A-Z0-9]{4,20}$/', $id) === 1 ? $id : null;
    }

    /**
     * Each private path plus everything under it.
     *
     * @return list<string>
     */
    private static function patterns(): array
    {
        $patterns = [];

        foreach (self::PRIVATE_PATHS as $path) {
            $patterns[] = $path;
            $patterns[] = $path.'/*';
        }

        return $patterns;
    }
}

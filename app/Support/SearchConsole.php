<?php

namespace App\Support;

use App\Models\Setting;

/**
 * FR6-18 — the Google Search Console verification token.
 *
 * The meta-tag method is used rather than the HTML file: the token lives in a
 * Setting, so the school can verify (or re-verify after a property change)
 * without a deploy, exactly as FR5-19 intends.
 */
class SearchConsole
{
    /**
     * Google issues a 43-character token, but the length has changed before;
     * the bound is deliberately loose while the alphabet stays strict.
     */
    private const TOKEN = '/^[A-Za-z0-9_-]{20,128}$/';

    /**
     * Re-checked on read as well as on write: a value that reached the table
     * some other way still cannot put markup into every page's head.
     */
    public static function token(): ?string
    {
        $value = self::extract(Setting::get('search_console_verification'));

        return $value !== null && preg_match(self::TOKEN, $value) === 1 ? $value : null;
    }

    /**
     * Accepts either the bare token or the whole `<meta …>` snippet Search
     * Console hands out, because the copy button on that screen copies the
     * tag. Validation still judges what comes back, so a paste that is neither
     * shape raises an error instead of silently clearing the field.
     */
    public static function extract(?string $value): ?string
    {
        $value = trim((string) $value);

        if (preg_match('/content\s*=\s*["\']([^"\']*)["\']/i', $value, $matches) === 1) {
            $value = trim($matches[1]);
        }

        return $value === '' ? null : $value;
    }
}

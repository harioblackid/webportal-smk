<?php

namespace App\Support;

use App\Models\Setting;

/**
 * The four public pages the school can switch off from the CMS.
 *
 * Off means gone, not merely unlinked: EnsurePageEnabled answers 404, the
 * navbar drops the item, and SitemapController stops advertising the URL. A
 * page that is hidden in the menu but still crawlable would be indexed while
 * the school believes it is unpublished.
 */
class PageVisibility
{
    /** @var list<string> */
    public const PAGES = ['identitas', 'spektrum', 'gallery', 'ekskul'];

    /** Every page defaults to on, so a fresh install has nothing hidden. */
    private const DEFAULT = true;

    /**
     * @return array<string, bool>
     */
    public static function all(): array
    {
        $values = Setting::query()
            ->whereIn('key', array_map(self::key(...), self::PAGES))
            ->pluck('value', 'key');

        $pages = [];

        foreach (self::PAGES as $page) {
            $stored = $values->get(self::key($page));

            $pages[$page] = $stored === null
                ? self::DEFAULT
                : filter_var($stored, FILTER_VALIDATE_BOOLEAN);
        }

        return $pages;
    }

    public static function enabled(string $page): bool
    {
        $stored = Setting::get(self::key($page));

        return $stored === null
            ? self::DEFAULT
            : filter_var($stored, FILTER_VALIDATE_BOOLEAN);
    }

    public static function set(string $page, bool $enabled): void
    {
        Setting::put(self::key($page), $enabled ? '1' : '0');
    }

    public static function key(string $page): string
    {
        return 'page_'.$page.'_enabled';
    }
}

<?php

namespace App\Support;

use App\Http\Resources\ImageResource;
use App\Models\Media;
use Illuminate\Support\Str;

/**
 * Builds the per-page metadata block that <SeoHead> renders (FR6-3, FR6-5).
 *
 * Kept server-side so title and description come from the same values the page
 * body was rendered from — a client-only helper would have to re-derive them.
 */
class Seo
{
    /**
     * @return array<string, mixed>
     */
    public static function page(
        string $title,
        ?string $description = null,
        ?Media $image = null,
        string $type = 'website',
    ): array {
        return [
            'title' => $title,
            'description' => $description === null ? null : self::trim($description),
            'image' => ImageResource::optional($image),
            'type' => $type,
        ];
    }

    /**
     * A meta description from the excerpt when there is one, else from the
     * rich-text body with its markup removed.
     */
    public static function describe(?string $excerpt, ?string $body = null): ?string
    {
        $source = trim((string) $excerpt) !== '' ? $excerpt : strip_tags((string) $body);
        $source = trim(preg_replace('/\s+/', ' ', (string) $source) ?? '');

        return $source === '' ? null : self::trim($source);
    }

    /** Search results cut off around 160 characters; do it deliberately. */
    private static function trim(string $value): string
    {
        return Str::limit($value, 160);
    }
}

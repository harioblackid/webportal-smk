<?php

namespace App\Support;

use App\Http\Resources\MediaResource;
use App\Models\Media;

/**
 * The list the media picker (US-014) shows inside the berita, hero, jurusan,
 * and pengaturan forms.
 *
 * Capped rather than paginated: the picker is a dialog over an unsaved form,
 * and paging it would mean either a second request that discards form state or
 * shipping the whole library. A school portal's library sits well under the
 * cap, and everything older stays reachable from the Media page itself.
 */
class MediaLibrary
{
    private const PICKER_LIMIT = 200;

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function options(): array
    {
        return MediaResource::many(
            Media::query()->latest('id')->limit(self::PICKER_LIMIT)->get()
        );
    }
}

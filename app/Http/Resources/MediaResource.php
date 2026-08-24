<?php

namespace App\Http\Resources;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A Media row as the admin grid and the media picker consume it (US-014).
 *
 * Richer than {@see ImageResource}, which is the public read shape — this one
 * carries the id the pickers submit and the housekeeping fields the library
 * lists.
 *
 * @mixin Media
 *
 * @phpstan-consistent-constructor
 */
class MediaResource extends JsonResource
{
    /**
     * @param  iterable<int, Media>  $media
     * @return array<int, array<string, mixed>>
     */
    public static function many(iterable $media): array
    {
        $request = request();
        $items = [];

        foreach ($media as $item) {
            $items[] = (new static($item))->toArray($request);
        }

        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'thumbUrl' => $this->thumbUrl(),
            'alt' => $this->alt ?? '',
            'filename' => $this->filename,
            'sizeLabel' => self::humanSize($this->size),
            'uploadedAtLabel' => $this->created_at?->translatedFormat('j M Y'),
        ];
    }

    private static function humanSize(int $bytes): string
    {
        return $bytes >= 1024 * 1024
            ? number_format($bytes / 1024 / 1024, 1).' MB'
            : number_format($bytes / 1024).' KB';
    }
}

<?php

namespace App\Http\Resources;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A Media row in the shape the public <Image> component wants.
 *
 * `alt` is never null on the way out (AD-3): a decorative-looking empty string
 * is still valid alt text, whereas a missing attribute is not.
 *
 * @mixin Media
 */
class ImageResource extends JsonResource
{
    /**
     * Resolved to a plain array on purpose: Inertia serialises a bare
     * JsonResource through its Responsable path, which wraps it in `data`.
     *
     * @return array<string, mixed>|null
     */
    public static function optional(?Media $media): ?array
    {
        return $media === null ? null : (new self($media))->toArray(request());
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'url' => $this->url(),
            'thumbUrl' => $this->thumbUrl(),
            'alt' => $this->alt ?? '',
        ];
    }
}

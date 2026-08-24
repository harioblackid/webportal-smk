<?php

namespace App\Http\Resources;

use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * FR4-16 — one entry in the /jurusan grid.
 *
 * @mixin Major
 *
 * @phpstan-consistent-constructor
 */
class MajorCardResource extends JsonResource
{
    /**
     * @param  iterable<int, Major>  $majors
     * @return array<int, array<string, mixed>>
     */
    public static function many(iterable $majors): array
    {
        $request = request();
        $cards = [];

        foreach ($majors as $major) {
            $cards[] = (new static($major))->toArray($request);
        }

        return $cards;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'url' => route('majors.show', $this->slug),
            'excerpt' => $this->excerpt,
            'image' => ImageResource::optional($this->media),
        ];
    }
}

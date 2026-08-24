<?php

namespace App\Http\Resources;

use App\Models\Post;
use Illuminate\Http\Request;

/**
 * FR4-10 — the card payload plus the rich-text body.
 *
 * @mixin Post
 */
class PostResource extends NewsCardResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'body' => $this->body,
        ];
    }
}

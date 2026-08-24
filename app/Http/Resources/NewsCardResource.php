<?php

namespace App\Http\Resources;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The card payload from FR4-8: thumbnail, title, category, date, excerpt.
 *
 * @mixin Post
 *
 * @phpstan-consistent-constructor
 */
class NewsCardResource extends JsonResource
{
    /**
     * @param  iterable<int, Post>  $posts
     * @return array<int, array<string, mixed>>
     */
    public static function many(iterable $posts): array
    {
        $request = request();
        $cards = [];

        foreach ($posts as $post) {
            $cards[] = (new static($post))->toArray($request);
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
            'title' => $this->title,
            'slug' => $this->slug,
            'url' => route('posts.show', $this->slug),
            'excerpt' => $this->excerpt,
            'type' => $this->type,
            'category' => $this->category === null ? null : [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'url' => route('posts.category', $this->category->slug),
            ],
            // Both forms: the ISO string feeds <time datetime>, the label is
            // what a reader actually sees.
            'publishedAt' => $this->published_at?->toIso8601String(),
            'publishedAtLabel' => $this->published_at?->translatedFormat('j F Y'),
            'image' => ImageResource::optional($this->featuredMedia),
        ];
    }
}

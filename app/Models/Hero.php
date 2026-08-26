<?php

namespace App\Models;

use Database\Factories\HeroFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string|null $subtitle
 * @property int|null $media_id
 * @property int|null $post_id
 * @property string|null $post_link_text
 * @property string|null $cta1_text
 * @property string|null $cta1_url
 * @property string|null $cta2_text
 * @property string|null $cta2_url
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'title',
    'subtitle',
    'media_id',
    'post_id',
    'post_link_text',
    'cta1_text',
    'cta1_url',
    'cta2_text',
    'cta2_url',
    'is_active',
    'sort_order',
])]
class Hero extends Model
{
    /** @use HasFactory<HeroFactory> */
    use HasFactory;

    /**
     * The carousel's budget, enforced on write by App\Rules\MaxActiveHeroes.
     *
     * Three full-bleed images share the first screen, and only the first is
     * eager — past that the LCP target stops being reachable on 3G.
     */
    public const MAX_ACTIVE = 3;

    /** Shown when a slide links to a berita but names no label of its own. */
    public const DEFAULT_POST_LINK_TEXT = 'Lihat selengkapnya';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Media, $this> */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * The berita this slide points at.
     *
     * Deliberately without withTrashed(): a soft-deleted berita must read as
     * absent here, because that is the only thing standing between a withdrawn
     * article and a link to it on the front page.
     *
     * @return BelongsTo<Post, $this>
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * The "Lihat selengkapnya" target, or null when there is nothing to link.
     *
     * Republishes the FR7-2 rule at read time: a draft, a scheduled berita, or
     * one that has been soft-deleted yields no URL at all.
     */
    public function postUrl(): ?string
    {
        $post = $this->post;

        if ($post === null || $post->trashed()) {
            return null;
        }

        $published = $post->status === 'published'
            && $post->published_at !== null
            && ! $post->published_at->isFuture();

        return $published ? route('posts.show', $post->slug) : null;
    }

    public function postLinkLabel(): string
    {
        $label = trim((string) $this->post_link_text);

        return $label === '' ? self::DEFAULT_POST_LINK_TEXT : $label;
    }

    /**
     * The slides the home page shows, in the order it shows them.
     *
     * FR5-13's "only one active hero" was retired on the school's instruction:
     * several may be active, and they become a carousel.
     *
     * @param  Builder<Hero>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param  Builder<Hero>  $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}

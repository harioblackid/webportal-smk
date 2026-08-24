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
 * @property string|null $cta1_text
 * @property string|null $cta1_url
 * @property string|null $cta2_text
 * @property string|null $cta2_url
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'title',
    'subtitle',
    'media_id',
    'cta1_text',
    'cta1_url',
    'cta2_text',
    'cta2_url',
    'is_active',
])]
class Hero extends Model
{
    /** @use HasFactory<HeroFactory> */
    use HasFactory;

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
     * FR7-6 says only one hero may be active. Enforcing that on write is
     * US-024's job; this scope is just the read side.
     *
     * @param  Builder<Hero>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}

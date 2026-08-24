<?php

namespace App\Models;

use Database\Factories\MajorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $excerpt
 * @property string|null $description
 * @property string|null $extra
 * @property int|null $media_id
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'name',
    'slug',
    'excerpt',
    'description',
    'extra',
    'media_id',
    'sort_order',
    'is_active',
])]
class Major extends Model
{
    /** @use HasFactory<MajorFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<Media, $this> */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * The public listing query from FR7-8 / FR7-9, in the exact shape the
     * (is_active, sort_order) composite index was built for.
     *
     * @param  Builder<Major>  $query
     */
    public function scopePublicList(Builder $query): void
    {
        $query->where('is_active', true)->orderBy('sort_order');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'slug', 'description', 'sort_order', 'is_active'])]
class CurriculumSpectrum extends Model
{
    protected $table = 'curriculum_spectra';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /** @return HasMany<CurriculumSubject, $this> */
    public function subjects(): HasMany
    {
        return $this->hasMany(CurriculumSubject::class, 'spectrum_id');
    }

    /**
     * What the public page shows, in the order it shows it.
     *
     * @param  Builder<CurriculumSpectrum>  $query
     */
    public function scopePublicList(Builder $query): void
    {
        $query->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }

    /** @param  Builder<CurriculumSpectrum>  $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}

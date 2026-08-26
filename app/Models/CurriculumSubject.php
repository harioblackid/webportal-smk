<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One mata pelajaran inside a spektrum. `group` is the kelompok it is listed
 * under (mis. "Mata Pelajaran Umum"), left null when the school does not
 * separate them.
 *
 * @property int $id
 * @property int $spectrum_id
 * @property string|null $group
 * @property string $name
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['spectrum_id', 'group', 'name', 'sort_order'])]
class CurriculumSubject extends Model
{
    /** @return BelongsTo<CurriculumSpectrum, $this> */
    public function spectrum(): BelongsTo
    {
        return $this->belongsTo(CurriculumSpectrum::class, 'spectrum_id');
    }

    /** @param  Builder<CurriculumSubject>  $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}

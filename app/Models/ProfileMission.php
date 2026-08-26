<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * One butir misi. Kept as rows rather than a JSON column on the visi section
 * so the list can be reordered and counted without rewriting a blob.
 *
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'description', 'sort_order'])]
class ProfileMission extends Model
{
    /** @param  Builder<ProfileMission>  $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}

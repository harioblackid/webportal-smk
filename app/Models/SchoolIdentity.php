<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'value'])]
class SchoolIdentity extends Model
{
    /** Named by the spec; Eloquent would otherwise look for `school_ids`. */
    protected $table = 'school_id';

    /** Reads a single field, or the given default when it is not set. */
    public static function get(string $key, ?string $default = null): ?string
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }

    public static function put(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * The whole record in one query — every caller wants most of it.
     *
     * @return array<string, string|null>
     */
    public static function values(): array
    {
        return static::query()->pluck('value', 'key')->all();
    }
}

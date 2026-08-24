<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * FR5-10 / FR5-15c — slugs are unique, and a collision resolves itself.
 *
 * The uniqueness check has to see soft-deleted rows: the unique index on
 * `slug` still counts them, so ignoring them would trade a friendly suffix for
 * a database error.
 */
class Slug
{
    /**
     * @param  class-string<Model>  $model
     * @param  int|null  $ignoreId  the row being updated, which may keep its own slug
     */
    public static function unique(
        string $model,
        string $source,
        ?int $ignoreId = null,
        string $column = 'slug',
    ): string {
        $base = Str::slug($source);

        if ($base === '') {
            $base = 'item';
        }

        $slug = $base;
        $suffix = 1;

        while (self::taken($model, $column, $slug, $ignoreId)) {
            $suffix++;
            $slug = $base.'-'.$suffix;
        }

        return $slug;
    }

    /**
     * @param  class-string<Model>  $model
     */
    private static function taken(string $model, string $column, string $slug, ?int $ignoreId): bool
    {
        $query = $model::query()->where($column, $slug);

        if (in_array(SoftDeletes::class, class_uses_recursive($model), true)) {
            /** @phpstan-ignore-next-line method.notFound — only reached when the model soft deletes */
            $query->withTrashed();
        }

        if ($ignoreId !== null) {
            $query->whereKeyNot($ignoreId);
        }

        return $query->exists();
    }
}

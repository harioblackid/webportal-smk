<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property string $title
 * @property string|null $body
 * @property int|null $media_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'title', 'body', 'media_id'])]
class ProfileSection extends Model
{
    /**
     * The sections the Visi Misi page lays out, in the order it renders them.
     *
     * @var list<string>
     */
    public const KEYS = ['sambutan', 'sejarah', 'visi', 'yayasan'];

    /** @return BelongsTo<Media, $this> */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}

<?php

namespace App\Models;

use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $path
 * @property string|null $thumb_path
 * @property string $filename
 * @property string $mime
 * @property int $size
 * @property string|null $alt
 * @property int|null $uploaded_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'path',
    'thumb_path',
    'filename',
    'mime',
    'size',
    'alt',
    'uploaded_by',
])]
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory;

    /** Eloquent would leave "media" alone, but say it outright. */
    protected $table = 'media';

    /** @return BelongsTo<User, $this> */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    /** Falls back to the full image so a card never renders a broken source. */
    public function thumbUrl(): string
    {
        return Storage::disk('public')->url($this->thumb_path ?? $this->path);
    }
}

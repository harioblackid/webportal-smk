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

    /**
     * Sections whose body is plain text, not rich text.
     *
     * The visi lead-in lands in the Steps widget's headline subtitle, which is
     * a `<p>`. Block markup there is illegal nesting: the browser closes the
     * outer paragraph early, the server HTML and the client tree disagree, and
     * React throws a hydration error on every render of the page.
     *
     * @var list<string>
     */
    public const PLAIN_TEXT_KEYS = ['visi'];

    public static function isPlainText(string $key): bool
    {
        return in_array($key, self::PLAIN_TEXT_KEYS, true);
    }

    /** @return BelongsTo<Media, $this> */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}

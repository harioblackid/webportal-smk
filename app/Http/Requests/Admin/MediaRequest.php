<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FR5-15 — upload constraints for the media library.
 *
 * OQ5-2 proposed 3 MB and nothing has overridden it, so that is the limit
 * enforced here. `image` on top of the mime list rejects a renamed archive
 * that happens to end in .jpg.
 */
class MediaRequest extends FormRequest
{
    /** Kilobytes, matching Laravel's `max` rule for uploads. */
    public const MAX_KILOBYTES = 3072;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.self::MAX_KILOBYTES],
            // FR5-17: optional at upload time, editable afterwards — an empty
            // alt is a legitimate choice for a decorative image.
            'alt' => ['nullable', 'string', 'max:200'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['file' => 'berkas', 'alt' => 'teks alternatif'];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.max' => 'Ukuran gambar maksimal 3 MB.',
            'file.mimes' => 'Format gambar harus JPG, PNG, atau WebP.',
        ];
    }
}

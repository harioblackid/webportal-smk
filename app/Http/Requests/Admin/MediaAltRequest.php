<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FR5-17 — editing alt text on an image already in the library.
 *
 * Separate from {@see MediaRequest} because that one requires a file: the
 * binary is not resubmitted when only the caption changes.
 */
class MediaAltRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'alt' => ['nullable', 'string', 'max:200'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['alt' => 'teks alternatif'];
    }
}

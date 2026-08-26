<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Album galeri: identitas album plus daftar foto yang ada di dalamnya. */
class GalleryAlbumRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'cover_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'sort_order' => ['integer', 'min:0', 'max:9999'],
            'is_active' => ['boolean'],

            'items' => ['present', 'array', 'max:200'],
            'items.*.media_id' => ['required', 'integer', Rule::exists('media', 'id')],
            'items.*.caption' => ['nullable', 'string', 'max:200'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'judul album',
            'description' => 'keterangan',
            'cover_media_id' => 'sampul album',
            'sort_order' => 'urutan',
            'items.*.media_id' => 'foto',
            'items.*.caption' => 'keterangan foto',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.*.media_id.required' => 'Setiap baris foto harus memilih gambar, atau hapus barisnya.',
        ];
    }
}

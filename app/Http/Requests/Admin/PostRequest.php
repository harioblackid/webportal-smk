<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * FR5-8 — the berita form. Both roles may write posts (prd-05 §2), so the
 * authorisation gate here is the `auth` middleware on the whole admin group.
 */
class PostRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            // Uniqueness is not asserted here: FR5-10 asks for a suffix, not a
            // validation error, so App\Support\Slug resolves the collision.
            'slug' => ['nullable', 'string', 'max:220'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'featured_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'body' => ['required', 'string'],
            'type' => ['required', Rule::in(['berita', 'pengumuman'])],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'published_at' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'judul',
            'slug' => 'slug',
            'category_id' => 'kategori',
            'featured_media_id' => 'gambar utama',
            'excerpt' => 'ringkasan',
            'body' => 'isi',
            'status' => 'status',
            'published_at' => 'tanggal terbit',
        ];
    }
}

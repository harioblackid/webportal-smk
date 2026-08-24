<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * FR5-15b — jurusan. The Superadmin-only gate (FR5-15a) is the route group's
 * middleware, so it applies to GET and POST alike.
 */
class MajorRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'description' => ['nullable', 'string'],
            'extra' => ['nullable', 'string'],
            'media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'sort_order' => ['required', 'integer', 'min:0', 'max:999'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama',
            'excerpt' => 'deskripsi singkat',
            'description' => 'deskripsi lengkap',
            'extra' => 'informasi tambahan',
            'media_id' => 'gambar',
            'sort_order' => 'urutan tampil',
        ];
    }
}

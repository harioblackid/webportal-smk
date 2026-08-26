<?php

namespace App\Http\Requests\Admin;

use App\Models\ProfileSection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Halaman Visi Misi — empat section tetap plus daftar misi yang bisa tumbuh. */
class ProfileSectionRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'sections' => ['required', 'array', 'size:'.count(ProfileSection::KEYS)],
            'sections.*.key' => ['required', 'string', Rule::in(ProfileSection::KEYS)],
            'sections.*.title' => ['required', 'string', 'max:200'],
            'sections.*.body' => ['nullable', 'string'],
            'sections.*.media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],

            // A cap, not a schema limit: an unbounded repeater is a way to
            // make the public page unreadable by accident.
            'missions' => ['present', 'array', 'max:20'],
            'missions.*.title' => ['required', 'string', 'max:200'],
            'missions.*.description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'sections.*.title' => 'judul section',
            'sections.*.body' => 'isi section',
            'sections.*.media_id' => 'gambar section',
            'missions.*.title' => 'judul misi',
            'missions.*.description' => 'keterangan misi',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'missions.*.title.required' => 'Setiap butir misi harus punya judul, atau hapus barisnya.',
        ];
    }
}

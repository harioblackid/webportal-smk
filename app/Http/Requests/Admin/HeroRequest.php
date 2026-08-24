<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** FR5-13 — hero halaman depan: judul, subjudul, gambar, hingga 2 CTA. */
class HeroRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'subtitle' => ['nullable', 'string', 'max:250'],
            'media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'cta1_text' => ['nullable', 'string', 'max:40'],
            // required_with, not required: a label without a target renders a
            // button that goes nowhere, which FR4-2 treats as broken.
            'cta1_url' => ['nullable', 'required_with:cta1_text', 'string', 'max:255'],
            'cta2_text' => ['nullable', 'string', 'max:40'],
            'cta2_url' => ['nullable', 'required_with:cta2_text', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'judul',
            'subtitle' => 'subjudul',
            'media_id' => 'gambar',
            'cta1_text' => 'teks tombol 1',
            'cta1_url' => 'URL tombol 1',
            'cta2_text' => 'teks tombol 2',
            'cta2_url' => 'URL tombol 2',
        ];
    }
}

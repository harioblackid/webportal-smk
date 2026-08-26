<?php

namespace App\Http\Requests\Admin;

use App\Models\Hero;
use App\Rules\MaxActiveHeroes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Hero halaman depan: judul, subjudul, gambar, tautan berita, hingga 2 CTA.
 *
 * Several heroes may be active at once — they become carousel slides — but no
 * more than Hero::MAX_ACTIVE of them.
 */
class HeroRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        // Null on store; on update it is the row being edited, which the rule
        // must exclude from its own count.
        $hero = $this->route('hero');
        $editing = $hero instanceof Hero ? $hero->id : null;

        return [
            'title' => ['required', 'string', 'max:150'],
            'subtitle' => ['nullable', 'string', 'max:250'],
            'media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],

            // A withdrawn berita must not be selectable: whereNull(deleted_at)
            // is what excludes one that was soft-deleted from the CMS.
            'post_id' => [
                'nullable',
                'integer',
                Rule::exists('posts', 'id')->whereNull('deleted_at'),
            ],
            'post_link_text' => ['nullable', 'string', 'max:60'],

            'cta1_text' => ['nullable', 'string', 'max:40'],
            // required_with, not required: a label without a target renders a
            // button that goes nowhere, which FR4-2 treats as broken.
            'cta1_url' => ['nullable', 'required_with:cta1_text', 'string', 'max:255'],
            'cta2_text' => ['nullable', 'string', 'max:40'],
            'cta2_url' => ['nullable', 'required_with:cta2_text', 'string', 'max:255'],

            'is_active' => [
                'boolean',
                new MaxActiveHeroes($editing),
            ],
            'sort_order' => ['integer', 'min:0', 'max:9999'],
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
            'post_id' => 'berita yang ditautkan',
            'post_link_text' => 'teks tombol berita',
            'cta1_text' => 'teks tombol 1',
            'cta1_url' => 'URL tombol 1',
            'cta2_text' => 'teks tombol 2',
            'cta2_url' => 'URL tombol 2',
            'sort_order' => 'urutan slide',
        ];
    }
}

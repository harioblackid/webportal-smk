<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/** Spektrum kurikulum: identitas spektrum plus daftar mata pelajarannya. */
class CurriculumSpectrumRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['integer', 'min:0', 'max:9999'],
            'is_active' => ['boolean'],

            // A spektrum with no mata pelajaran renders as an empty heading on
            // the public page, which is worse than not publishing it at all.
            'subjects' => ['present', 'array', 'max:100'],
            'subjects.*.group' => ['nullable', 'string', 'max:100'],
            'subjects.*.name' => ['required', 'string', 'max:150'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama spektrum',
            'description' => 'keterangan',
            'sort_order' => 'urutan',
            'subjects.*.group' => 'kelompok',
            'subjects.*.name' => 'nama mata pelajaran',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'subjects.*.name.required' => 'Setiap baris mata pelajaran harus punya nama, atau hapus barisnya.',
        ];
    }
}

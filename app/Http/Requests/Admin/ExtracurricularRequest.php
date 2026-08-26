<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Ekstrakurikuler: nama, keterangan, pembina, jadwal, foto. */
class ExtracurricularRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'pembina' => ['nullable', 'string', 'max:100'],
            'jadwal' => ['nullable', 'string', 'max:150'],
            'media_id' => ['nullable', 'integer', Rule::exists('media', 'id')],
            'sort_order' => ['integer', 'min:0', 'max:9999'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama ekstrakurikuler',
            'description' => 'keterangan',
            'pembina' => 'pembina',
            'jadwal' => 'jadwal',
            'media_id' => 'foto',
            'sort_order' => 'urutan',
        ];
    }
}

<?php

namespace App\Http\Requests\Admin;

use App\Support\SchoolIdentityFields;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Identitas sekolah — rules come straight from the field catalogue, so a field
 * can never reach the form without also reaching the validator.
 */
class SchoolIdentityRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return SchoolIdentityFields::rules();
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return SchoolIdentityFields::attributes();
    }
}

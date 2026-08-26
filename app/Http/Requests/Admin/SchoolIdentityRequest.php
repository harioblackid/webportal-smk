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
        $rules = ['enabled' => ['boolean']];

        // With the page switched off its fields are disabled in the form, so
        // an error on one of them would have no control to fix it in. The
        // toggle then travels alone and the stored values are left untouched.
        if ($this->boolean('enabled')) {
            $rules += SchoolIdentityFields::rules();
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return SchoolIdentityFields::attributes();
    }
}

<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The lone on/off switch on a module's index page.
 *
 * Its own request rather than a field on the module's form: index pages carry
 * a list, not a record, so the toggle is the whole payload there.
 */
class PageVisibilityRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
        ];
    }
}

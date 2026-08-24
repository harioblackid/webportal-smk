<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/** FR5-20 — akun & role, Superadmin only (enforced by the route group). */
class UserRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $user = $this->route('user');
        $isUpdate = $user instanceof User;

        return [
            'name' => ['required', 'string', 'max:120'],
            // Soft-deleted accounts keep their row, and the unique index on
            // `email` counts them — so the rule must too.
            'email' => [
                'required', 'email', 'max:120',
                Rule::unique('users', 'email')->ignore($isUpdate ? $user->getKey() : null),
            ],
            // FR5-4 leaves hashing to Laravel; the form only decides whether a
            // password is being set at all. On edit, blank means "unchanged".
            'password' => [
                $isUpdate ? 'nullable' : 'required',
                'confirmed',
                Password::defaults(),
            ],
            'role' => ['required', Rule::enum(UserRole::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama',
            'email' => 'email',
            'password' => 'kata sandi',
            'role' => 'role',
        ];
    }
}

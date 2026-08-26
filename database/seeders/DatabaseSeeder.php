<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * FR5-3 rules out public registration, so the first accounts have to come
     * from somewhere — this is it. Every later account is created from
     * /admin/users by a Superadmin (US-016).
     */
    public const SUPERADMIN_EMAIL = 'admin@smk.com';

    /**
     * An Editor is seeded alongside the Superadmin because FR5-2 is a two-role
     * split: proving an Editor gets 403 on a Superadmin route needs an actual
     * Editor to log in as.
     */
    public const EDITOR_EMAIL = 'editor@smk.com';

    /**
     * A bootstrap credential, not a secret. Both accounts share it; change it
     * from the admin panel right after the first login.
     */
    public const PASSWORD = 'adminsmk99';

    /**
     * Idempotent. A re-run resets both accounts to the constants above rather
     * than skipping them, so the credentials in code are always the credentials
     * that work — the browser suite logs in with exactly these.
     */
    public function run(): void
    {
        $this->account(self::SUPERADMIN_EMAIL, 'Superadmin', UserRole::Superadmin);
        $this->account(self::EDITOR_EMAIL, 'Editor', UserRole::Editor);
    }

    private function account(string $email, string $name, UserRole $role): User
    {
        $user = User::withTrashed()->firstOrNew(['email' => $email]);

        $user->fill([
            'name' => $name,
            'password' => Hash::make(self::PASSWORD),
            'role' => $role,
            'email_verified_at' => now(),
        ]);
        $user->deleted_at = null;
        $user->save();

        return $user;
    }
}

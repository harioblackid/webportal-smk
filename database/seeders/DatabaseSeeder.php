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
     * Idempotent, and safe to run on every release: deploy/release.sh calls
     * `db:seed --force` each time, so nothing here may overwrite what the
     * school has since changed in the CMS.
     */
    public function run(): void
    {
        $this->account(self::SUPERADMIN_EMAIL, 'Superadmin', UserRole::Superadmin);
        $this->account(self::EDITOR_EMAIL, 'Editor', UserRole::Editor);

        // The school's own jurusan and ekstrakurikuler. Safe to run every time
        // — it is idempotent by slug and never overwrites CMS edits.
        $this->call(SchoolContentSeeder::class);

        // The identity record and the site settings a fresh database would
        // otherwise have no rows for at all. Both insert-if-absent.
        $this->call(SchoolIdentitySeeder::class);
        $this->call(SettingsSeeder::class);
    }

    /**
     * Outside production a re-run resets the account to the constants above, so
     * the credentials in code are always the credentials that work and the
     * browser suite can log in with exactly these.
     *
     * In production the password and role are written only when the account is
     * genuinely new. Without that, every release would hand the Superadmin
     * account back to the bootstrap password published in this file — undoing
     * the change the school was told to make right after their first login.
     */
    private function account(string $email, string $name, UserRole $role): User
    {
        $user = User::withTrashed()->firstOrNew(['email' => $email]);

        if (! $user->exists || ! app()->isProduction()) {
            $user->password = Hash::make(self::PASSWORD);
            $user->role = $role;
        }

        $user->fill([
            'name' => $name,
            'email_verified_at' => now(),
        ]);
        $user->deleted_at = null;
        $user->save();

        return $user;
    }
}

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
     * FR5-3 rules out public registration, so the first Superadmin has to come
     * from somewhere — this is it. Every later account is created from
     * /admin/users by that Superadmin (US-016).
     *
     * The password below is a bootstrap credential, not a secret: change it
     * from the admin panel right after the first login.
     *
     * Idempotent, and safe to re-run — an existing account keeps its password.
     */
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@smkpgritelagasari.sch.id'],
            [
                'name' => 'Superadmin',
                'password' => Hash::make('password'),
                'role' => UserRole::Superadmin,
                'email_verified_at' => now(),
            ],
        );
    }
}

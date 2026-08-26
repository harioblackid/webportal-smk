<?php

use App\Enums\UserRole;
use App\Models\SchoolIdentity;
use App\Models\Setting;
use App\Models\User;
use App\Support\PageVisibility;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Hash;

use function Pest\Laravel\artisan;
use function Pest\Laravel\seed;

/*
 * deploy/release.sh runs `db:seed --force` on every release (FR8-13), so these
 * are not academic properties: a seeder that wrote unconditionally would undo
 * the school's CMS edits each time a release went out, and one that reset the
 * password would hand the Superadmin account back to the credential printed in
 * DatabaseSeeder.
 */

test('a fresh seed creates the identity skeleton and the site settings', function () {
    seed(DatabaseSeeder::class);

    expect(SchoolIdentity::get('nama_sekolah'))->toBe('SMK PGRI Telagasari')
        ->and(SchoolIdentity::get('jenjang_pendidikan'))->toBe('SMK')
        ->and(SchoolIdentity::get('status_sekolah'))->toBe('Swasta')
        // Written by the create-school_id migration, not by the seeder, and
        // still present afterwards.
        ->and(SchoolIdentity::get('sumber_listrik'))->toBe('PLN')
        ->and(Setting::get('maps_mode'))->toBe('link')
        ->and(Setting::get('ppdb_enabled'))->toBe('0');

    foreach (PageVisibility::PAGES as $page) {
        expect(Setting::get(PageVisibility::key($page)))->toBe('1');
    }
});

test('the seeder invents no Dapodik figures', function () {
    seed(DatabaseSeeder::class);

    // NPSN, address, phone, and akreditasi are real-world records this
    // repository does not hold. Seeding a placeholder would publish a
    // fabricated figure on the Identitas page.
    expect(SchoolIdentity::get('npsn'))->toBeNull()
        ->and(SchoolIdentity::get('alamat'))->toBeNull()
        ->and(SchoolIdentity::get('nomor_telepon'))->toBeNull()
        ->and(SchoolIdentity::get('email'))->toBeNull()
        ->and(SchoolIdentity::get('akreditasi'))->toBeNull();
});

test('re-seeding never overwrites an edit made in the CMS', function () {
    seed(DatabaseSeeder::class);

    SchoolIdentity::put('nama_sekolah', 'SMK PGRI Telagasari (revisi)');
    SchoolIdentity::put('npsn', '12345678');
    Setting::put('maps_mode', 'coordinates');
    Setting::put(PageVisibility::key('gallery'), '0');

    seed(DatabaseSeeder::class);

    expect(SchoolIdentity::get('nama_sekolah'))->toBe('SMK PGRI Telagasari (revisi)')
        ->and(SchoolIdentity::get('npsn'))->toBe('12345678')
        ->and(Setting::get('maps_mode'))->toBe('coordinates')
        ->and(Setting::get(PageVisibility::key('gallery')))->toBe('0');
});

test('re-seeding adds a key the database is missing without touching the rest', function () {
    seed(DatabaseSeeder::class);

    Setting::put('tagline', 'Tagline milik sekolah');
    Setting::query()->where('key', 'maps_mode')->delete();

    seed(DatabaseSeeder::class);

    expect(Setting::get('maps_mode'))->toBe('link')
        ->and(Setting::get('tagline'))->toBe('Tagline milik sekolah');
});

test('re-seeding outside production resets the bootstrap credentials', function () {
    seed(DatabaseSeeder::class);

    $user = User::query()->where('email', DatabaseSeeder::SUPERADMIN_EMAIL)->firstOrFail();
    $user->forceFill(['password' => Hash::make('sesuatu-yang-lain')])->save();

    seed(DatabaseSeeder::class);

    // The browser suite signs in with the constants in DatabaseSeeder, so
    // outside production they have to keep working after a re-seed.
    expect(Hash::check(DatabaseSeeder::PASSWORD, $user->fresh()->password))->toBeTrue();
});

test('re-seeding in production leaves a changed password alone', function () {
    seed(DatabaseSeeder::class);

    $user = User::query()->where('email', DatabaseSeeder::SUPERADMIN_EMAIL)->firstOrFail();
    $user->forceFill(['password' => Hash::make('password-pilihan-sekolah')])->save();

    // Not config(['app.env' => …]): Application::environment() reads the `env`
    // binding captured at boot, which a config change does not touch.
    App::detectEnvironment(fn () => 'production');

    // `--force` because that is what deploy/release.sh runs; without it the
    // command stops on the production confirmation prompt.
    artisan('db:seed', ['--force' => true])->assertSuccessful();

    expect(Hash::check('password-pilihan-sekolah', $user->fresh()->password))->toBeTrue()
        ->and(Hash::check(DatabaseSeeder::PASSWORD, $user->fresh()->password))->toBeFalse();
});

test('a production seed still creates the accounts when they do not exist yet', function () {
    App::detectEnvironment(fn () => 'production');

    artisan('db:seed', ['--force' => true])->assertSuccessful();

    $user = User::query()->where('email', DatabaseSeeder::SUPERADMIN_EMAIL)->firstOrFail();

    expect(Hash::check(DatabaseSeeder::PASSWORD, $user->password))->toBeTrue()
        ->and($user->role)->toBe(UserRole::Superadmin);
});

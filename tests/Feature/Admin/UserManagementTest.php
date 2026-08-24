<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

// US-016 — manajemen pengguna & role (Superadmin).

function userPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Bendahara Sekolah',
        'email' => 'bendahara@example.test',
        'password' => 'rahasia-sekali-1',
        'password_confirmation' => 'rahasia-sekali-1',
        'role' => 'editor',
    ], $overrides);
}

test('an editor cannot see or touch the user module', function () {
    $editor = User::factory()->create();
    $other = User::factory()->create();

    actingAs($editor)->get(route('admin.users.index'))->assertForbidden();
    actingAs($editor)->get(route('admin.users.create'))->assertForbidden();
    actingAs($editor)->post(route('admin.users.store'), userPayload())->assertForbidden();
    actingAs($editor)->delete(route('admin.users.destroy', $other))->assertForbidden();

    expect(User::query()->count())->toBe(2);
});

test('a superadmin creates an account with a hashed password', function () {
    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.users.store'), userPayload())
        ->assertRedirect(route('admin.users.index'));

    $created = User::query()->where('email', 'bendahara@example.test')->sole();

    expect($created->role)->toBe(UserRole::Editor)
        // FR5-4: never stored in the clear.
        ->and($created->password)->not->toBe('rahasia-sekali-1')
        ->and(Hash::check('rahasia-sekali-1', $created->password))->toBeTrue();
});

test('a new account can be given the superadmin role', function () {
    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.users.store'), userPayload(['role' => 'superadmin']));

    expect(User::query()->where('email', 'bendahara@example.test')->sole()->role)
        ->toBe(UserRole::Superadmin);
});

test('an account can be edited without changing its password', function () {
    $user = User::factory()->create();
    $original = $user->password;

    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.users.update', $user), userPayload([
            'name' => 'Nama Baru',
            'email' => $user->email,
            'password' => '',
            'password_confirmation' => '',
        ]))
        ->assertRedirect(route('admin.users.index'));

    expect($user->refresh()->name)->toBe('Nama Baru')
        ->and($user->password)->toBe($original);
});

test('a password given on edit replaces the old one', function () {
    $user = User::factory()->create();

    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.users.update', $user), userPayload([
            'email' => $user->email,
            'password' => 'sandi-baru-yang-kuat',
            'password_confirmation' => 'sandi-baru-yang-kuat',
        ]));

    expect(Hash::check('sandi-baru-yang-kuat', $user->refresh()->password))->toBeTrue();
});

test('a duplicate email is rejected', function () {
    User::factory()->create(['email' => 'bendahara@example.test']);

    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.users.store'), userPayload())
        ->assertSessionHasErrors('email');
});

// FR5-21 — Superadmin terakhir tidak dapat dihapus.

test('the last superadmin cannot be deleted', function () {
    $superadmin = User::factory()->superadmin()->create();
    $actor = User::factory()->superadmin()->create();

    // Two superadmins: deleting one is allowed.
    actingAs($actor)
        ->delete(route('admin.users.destroy', $superadmin))
        ->assertRedirect(route('admin.users.index'));

    expect(User::query()->where('role', UserRole::Superadmin)->count())->toBe(1);

    // Now $actor is the last one — and cannot remove the only other candidate
    // by removing themselves either.
    $another = User::factory()->superadmin()->create();
    $another->delete();

    actingAs($actor)->delete(route('admin.users.destroy', $actor))
        ->assertSessionHas('error');

    expect(User::query()->where('role', UserRole::Superadmin)->count())->toBe(1);
});

test('the last superadmin cannot be demoted to editor either', function () {
    // Same lockout as FR5-21, reached through the role selector.
    $superadmin = User::factory()->superadmin()->create();

    actingAs($superadmin)
        ->put(route('admin.users.update', $superadmin), userPayload([
            'email' => $superadmin->email,
            'password' => '',
            'password_confirmation' => '',
            'role' => 'editor',
        ]))
        ->assertSessionHas('error');

    expect($superadmin->refresh()->role)->toBe(UserRole::Superadmin);
});

test('a superadmin cannot delete the account they are signed in as', function () {
    $actor = User::factory()->superadmin()->create();
    User::factory()->superadmin()->create();

    actingAs($actor)
        ->delete(route('admin.users.destroy', $actor))
        ->assertSessionHas('error');

    expect(User::query()->whereKey($actor->id)->exists())->toBeTrue();
});

test('deleting an editor soft deletes the account', function () {
    $editor = User::factory()->create();

    actingAs(User::factory()->superadmin()->create())
        ->delete(route('admin.users.destroy', $editor));

    expect(User::query()->whereKey($editor->id)->exists())->toBeFalse()
        ->and(User::withTrashed()->whereKey($editor->id)->exists())->toBeTrue();
});

test('the edit form flags the last superadmin', function () {
    $superadmin = User::factory()->superadmin()->create();

    actingAs($superadmin)
        ->get(route('admin.users.edit', $superadmin))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/users/form')
            ->where('user.isLastSuperadmin', true)
            ->has('roles', 2));
});

<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    RateLimiter::clear('');
});

// US-010 — "Login email+password berhasil; kredensial salah ditolak".

test('the login screen renders', function () {
    get(route('login'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('auth/login')
            ->where('canResetPassword', true));
});

test('a user can log in with the right credentials', function () {
    $user = User::factory()->create();

    post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
});

test('a wrong password is rejected with a message on the email field', function () {
    $user = User::factory()->create();

    post(route('login'), [
        'email' => $user->email,
        'password' => 'salah-total',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('login is rate limited after five failed attempts', function () {
    // NFR-13: brute force protection, inherited from Breeze's LoginRequest.
    $user = User::factory()->create();

    foreach (range(1, 5) as $ignored) {
        post(route('login'), [
            'email' => $user->email,
            'password' => 'salah-total',
        ]);
    }

    post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('a user can log out', function () {
    actingAs(User::factory()->create())
        ->post(route('logout'))
        ->assertRedirect('/');

    $this->assertGuest();
});

test('rejection messages are readable Indonesian, not translation keys', function () {
    // US-010 asks for a "pesan jelas". Without lang/id/* Laravel echoes the raw
    // key (`auth.failed`), which is what the browser check actually caught.
    $user = User::factory()->create();

    $errors = post(route('login'), [
        'email' => $user->email,
        'password' => 'salah-total',
    ])->assertSessionHasErrors('email')
        ->getSession()
        ->get('errors')
        ->getBag('default');

    expect($errors->first('email'))
        ->toBe('Email atau kata sandi salah.')
        ->not->toContain('auth.');

    $missing = post(route('login'), [])
        ->assertSessionHasErrors(['email', 'password'])
        ->getSession()
        ->get('errors')
        ->getBag('default');

    expect($missing->first('email'))->toBe('Kolom email wajib diisi.')
        ->and($missing->first('password'))->toBe('Kolom kata sandi wajib diisi.');
});

test('there is no public registration route', function () {
    // FR5-3: accounts are created by a Superadmin, never self-served.
    expect(app('router')->getRoutes()->hasNamedRoute('register'))->toBeFalse();
});

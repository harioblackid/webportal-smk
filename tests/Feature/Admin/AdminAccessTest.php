<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// US-010 — "Rute /admin/* menolak akses tanpa login".

test('guests are redirected to login from every admin route', function (string $route) {
    get($route)->assertRedirect(route('login'));
})->with([
    'dashboard' => fn () => route('admin.dashboard'),
    'posts' => fn () => route('admin.posts.index'),
    'categories' => fn () => route('admin.categories.index'),
    'heroes' => fn () => route('admin.heroes.index'),
    'media' => fn () => route('admin.media.index'),
    'majors' => fn () => route('admin.majors.index'),
    'settings' => fn () => route('admin.settings.edit'),
    'users' => fn () => route('admin.users.index'),
]);

test('an editor reaches every shared module', function (string $name) {
    // prd-05 §2: berita, kategori, hero, and media are open to both roles.
    actingAs(User::factory()->create())
        ->get(route($name))
        ->assertOk();
})->with([
    'admin.posts.index',
    'admin.posts.create',
    'admin.categories.index',
    'admin.heroes.index',
    'admin.media.index',
]);

test('a signed-in editor reaches the dashboard', function () {
    actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('admin/dashboard'));
});

// US-010 — "Editor mengakses rute khusus Superadmin mendapat 403" (FR5-2).

test('an editor hitting a superadmin route gets 403, not a redirect', function (string $name) {
    actingAs(User::factory()->create())
        ->get(route($name))
        ->assertForbidden();
})->with([
    'admin.majors.index',
    'admin.majors.create',
    'admin.settings.edit',
    'admin.users.index',
    'admin.users.create',
]);

test('a superadmin reaches the superadmin route', function () {
    actingAs(User::factory()->superadmin()->create())
        ->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('admin/users/index'));
});

// US-010 — "/admin/* diberi header noindex" (FR5-5, FR6-2).

test('every admin response carries the noindex header', function (string $name) {
    actingAs(User::factory()->superadmin()->create())
        ->get(route($name))
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
})->with([
    'admin.dashboard',
    'admin.posts.index',
    'admin.categories.index',
    'admin.heroes.index',
    'admin.media.index',
    'admin.majors.index',
    'admin.settings.edit',
    'admin.users.index',
]);

test('the noindex header survives the guest redirect too', function () {
    // A redirect has no HTML body, so a <meta> tag could not cover this case.
    get(route('admin.dashboard'))
        ->assertRedirect(route('login'))
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
});

test('the noindex header survives the 403 too', function () {
    // Both of these leave through the exception handler, which unwinds past
    // route middleware — hence the respond() hook in bootstrap/app.php.
    actingAs(User::factory()->create())
        ->get(route('admin.users.index'))
        ->assertForbidden()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
});

test('public pages are not marked noindex', function () {
    get(route('home'))->assertHeaderMissing('X-Robots-Tag');
});

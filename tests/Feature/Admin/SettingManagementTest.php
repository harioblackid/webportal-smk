<?php

use App\Models\Setting;
use App\Models\User;
use App\Support\Analytics;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// US-015 — pengaturan situs (Superadmin).

function settingPayload(array $overrides = []): array
{
    return array_merge([
        'tagline' => 'Terampil, Mandiri, Berakhlak',
        'logo_media_id' => null,
        'contact_whatsapp' => '081234567890',
        'maps_mode' => 'link',
        'maps_embed' => '',
        'ppdb_enabled' => false,
        'ppdb_url' => '',
        'ppdb_banner_media_id' => null,
        'ga4_measurement_id' => '',
        'search_console_verification' => '',
    ], $overrides);
}

test('an editor cannot reach the settings page or save it', function () {
    $editor = User::factory()->create();

    actingAs($editor)->get(route('admin.settings.edit'))->assertForbidden();
    actingAs($editor)->put(route('admin.settings.update'), settingPayload())->assertForbidden();

    expect(Setting::query()->count())->toBe(0);
});

// FR5-19 — perubahan Setting langsung tercermin di situs publik.

test('settings changes reach the public pages immediately', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'tagline' => 'Terampil dan Mandiri',
            'contact_whatsapp' => '081234567890',
        ]))
        ->assertRedirect(route('admin.settings.edit'));

    get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.tagline', 'Terampil dan Mandiri')
            ->where('site.contact.whatsappHref', 'https://wa.me/6281234567890'));
});

test('the ppdb banner can be switched on with its target', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'ppdb_enabled' => true,
            'ppdb_url' => 'https://ppdb.example.test',
        ]));

    get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.ppdb.enabled', true)
            ->where('site.ppdb.url', 'https://ppdb.example.test'));
});

// FR4-14 — a banner without a target is worse than no banner.

test('switching the banner on without a url is rejected', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload(['ppdb_enabled' => true]))
        ->assertSessionHasErrors('ppdb_url');
});

test('a cleared field falls back instead of storing an empty string', function () {
    Setting::put('tagline', 'Lama');

    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload(['tagline' => '']));

    expect(Setting::get('tagline'))->toBeNull();
});

// US-015 — "kode tracking termuat di situs publik".

test('the ga4 tag is rendered on public pages once the id is set', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'ga4_measurement_id' => 'G-ABC1234567',
        ]));

    get(route('home'))
        ->assertOk()
        ->assertSee('googletagmanager.com/gtag/js?id=G-ABC1234567', false);
});

test('the ga4 tag is not loaded inside the admin area', function () {
    // FR5-5 keeps /admin out of the index, and staff editing is not traffic.
    Setting::put('ga4_measurement_id', 'G-ABC1234567');

    actingAs(User::factory()->superadmin()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertDontSee('googletagmanager.com', false);
});

test('the ga4 tag is not loaded on the auth screens either', function (string $url) {
    // robots.txt disallows these, so counting them as visitor traffic reports
    // arrivals Search Console will never corroborate.
    Setting::put('ga4_measurement_id', 'G-ABC1234567');

    get($url)->assertOk()->assertDontSee('googletagmanager.com', false);
})->with([
    'login' => fn () => route('login'),
    'forgot password' => fn () => route('password.request'),
]);

test('robots disallows exactly the paths analytics skips', function () {
    // One list, so a page cannot fall out of the index yet stay in the stats.
    $robots = get('/robots.txt')->assertOk()->getContent();

    foreach (Analytics::PRIVATE_PATHS as $path) {
        expect($robots)->toContain('Disallow: /'.$path);
    }

    expect(substr_count((string) $robots, 'Disallow:'))
        ->toBe(count(Analytics::PRIVATE_PATHS));
});

test('no analytics script is emitted when no id is configured', function () {
    get(route('home'))->assertDontSee('googletagmanager.com', false);
});

test('a map link that cannot be framed is refused at the form', function () {
    // The failure it prevents is silent: a share URL saved fine, then Google
    // answered X-Frame-Options and the Kontak page showed an empty box.
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'maps_embed' => 'https://maps.app.goo.gl/abc123',
        ]))
        ->assertSessionHasErrors('maps_embed');
});

test('a share link is accepted and reaches the page in embeddable form', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'maps_embed' => 'https://www.google.com/maps/place/Sekolah/@-6.28,107.40,17z/data=!3d-6.2897689!4d107.3909987',
        ]))
        ->assertSessionHasNoErrors();

    get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where(
            'mapsEmbedUrl',
            'https://maps.google.com/maps?q=-6.2897689,107.3909987&hl=id&z=16&output=embed',
        ));
});

test('coordinate mode does not fail on a link field it never reads', function () {
    // Failing it there would block the save over a value nobody can see.
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'maps_mode' => 'coordinates',
            'maps_embed' => 'https://maps.app.goo.gl/abc123',
        ]))
        ->assertSessionHasNoErrors();
});

test('a malformed measurement id is rejected', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'ga4_measurement_id' => 'UA-12345-1',
        ]))
        ->assertSessionHasErrors('ga4_measurement_id');
});

test('the settings form is prefilled from the stored values', function () {
    Setting::put('tagline', 'Terampil, Mandiri, Berakhlak');

    actingAs(User::factory()->superadmin()->create())
        ->get(route('admin.settings.edit'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/settings/edit')
            ->where('settings.tagline', 'Terampil, Mandiri, Berakhlak')
            ->has('mediaLibrary'));
});

// US-020 / FR6-18 — verifikasi Search Console lewat meta tag.

test('the verification tag is rendered on public pages once the token is set', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'search_console_verification' => 'aBc123_tokenVerifikasiGoogle-01',
        ]));

    get(route('home'))
        ->assertOk()
        ->assertSee(
            '<meta name="google-site-verification" content="aBc123_tokenVerifikasiGoogle-01">',
            false
        );
});

test('a whole meta tag pasted from google is reduced to its token', function () {
    // The Copy button on the Search Console screen copies the entire tag.
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'search_console_verification' => '<meta name="google-site-verification" content="aBc123_tokenVerifikasiGoogle-01" />',
        ]))
        ->assertSessionHasNoErrors();

    expect(Setting::get('search_console_verification'))
        ->toBe('aBc123_tokenVerifikasiGoogle-01');
});

test('a paste that is neither a token nor a meta tag is rejected', function () {
    // Rejected rather than silently dropped: markup here would land in the
    // head of every page on the site.
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload([
            'search_console_verification' => '"><script>alert(1)</script>',
        ]))
        ->assertSessionHasErrors('search_console_verification');

    expect(Setting::get('search_console_verification'))->toBeNull();
});

test('no verification tag is emitted when the field is empty', function () {
    get(route('home'))->assertDontSee('google-site-verification', false);
});

test('clearing the field removes the tag again', function () {
    Setting::put('search_console_verification', 'aBc123_tokenVerifikasiGoogle-01');

    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.settings.update'), settingPayload());

    get(route('home'))->assertDontSee('google-site-verification', false);
});

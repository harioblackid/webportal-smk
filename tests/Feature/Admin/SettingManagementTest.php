<?php

use App\Models\Setting;
use App\Models\User;
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

test('no analytics script is emitted when no id is configured', function () {
    get(route('home'))->assertDontSee('googletagmanager.com', false);
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

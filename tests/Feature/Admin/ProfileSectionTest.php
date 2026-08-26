<?php

use App\Models\ProfileMission;
use App\Models\ProfileSection;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// Halaman Visi Misi — isi Profil yang dulu berupa konstanta di profil.tsx.

function profilePayload(array $overrides = []): array
{
    $sections = array_map(fn (string $key) => [
        'key' => $key,
        'title' => 'Judul '.$key,
        'body' => '<p>Isi '.$key.'.</p>',
        'media_id' => null,
    ], ProfileSection::KEYS);

    return array_merge([
        'sections' => $sections,
        'missions' => [
            ['title' => 'Misi pertama', 'description' => 'Keterangan pertama.'],
            ['title' => 'Misi kedua', 'description' => ''],
        ],
    ], $overrides);
}

test('the migration seeds the page so it is never blank', function () {
    expect(ProfileSection::query()->count())->toBe(count(ProfileSection::KEYS))
        ->and(ProfileMission::query()->count())->toBe(4);
});

// prd-05 §2 — editorial content is open to both roles.

test('an editor may edit the page', function () {
    actingAs(User::factory()->create())
        ->get(route('admin.profile-sections.edit'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/profile-sections/edit')
            ->has('sections', count(ProfileSection::KEYS))
            ->has('missions', 4)
            ->has('mediaLibrary')
        );
});

test('saving rewrites the sections and the mission list', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.profile-sections.update'), profilePayload())
        ->assertRedirect(route('admin.profile-sections.edit'));

    expect(ProfileSection::query()->where('key', 'visi')->value('title'))
        ->toBe('Judul visi')
        ->and(ProfileMission::query()->count())->toBe(2)
        ->and(ProfileMission::query()->ordered()->pluck('title')->all())
        ->toBe(['Misi pertama', 'Misi kedua'])
        // Blank keterangan is stored as null, so the page has one empty state
        // to test for rather than two.
        ->and(ProfileMission::query()->ordered()->get()->last()->description)
        ->toBeNull();
});

test('mission order follows the order the rows were submitted in', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.profile-sections.update'), profilePayload([
            'missions' => [
                ['title' => 'Ketiga', 'description' => ''],
                ['title' => 'Pertama', 'description' => ''],
            ],
        ]));

    expect(ProfileMission::query()->ordered()->pluck('sort_order')->all())
        ->toBe([0, 1])
        ->and(ProfileMission::query()->ordered()->pluck('title')->all())
        ->toBe(['Ketiga', 'Pertama']);
});

test('the mission list can be emptied entirely', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.profile-sections.update'), profilePayload(['missions' => []]));

    expect(ProfileMission::query()->count())->toBe(0);
});

test('a mission row without a title is rejected', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.profile-sections.update'), profilePayload([
            'missions' => [['title' => '', 'description' => 'Tanpa judul.']],
        ]))
        ->assertSessionHasErrors('missions.0.title');
});

// FR5-9 — rich text is stored sanitised, never raw.

test('script in a section body never reaches the database', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.profile-sections.update'), profilePayload([
            'sections' => array_map(fn (string $key) => [
                'key' => $key,
                'title' => 'Judul '.$key,
                'body' => '<p>Aman</p><script>alert(1)</script>',
                'media_id' => null,
            ], ProfileSection::KEYS),
        ]));

    expect(ProfileSection::query()->where('key', 'sambutan')->value('body'))
        ->not->toContain('<script')
        ->toContain('Aman');
});

test('the public profil page renders what the CMS holds', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.profile-sections.update'), profilePayload([
            'sections' => array_map(fn (string $key) => [
                'key' => $key,
                'title' => $key === 'visi' ? 'Visi sekolah kami' : 'Judul '.$key,
                'body' => '<p>Isi '.$key.'.</p>',
                'media_id' => null,
            ], ProfileSection::KEYS),
        ]));

    get(route('profil'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/profil')
            ->has('sections', count(ProfileSection::KEYS))
            ->where('sections.2.key', 'visi')
            ->where('sections.2.title', 'Visi sekolah kami')
            ->where('missions.0.title', 'Misi pertama')
        );
});

// The visi lead-in lands inside the Steps headline's <p> on the public page.
// Block markup there is illegal nesting, which fails React hydration on every
// render — so it is stripped on write and on read.

test('the visi lead-in is stored and delivered as plain text', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.profile-sections.update'), profilePayload([
            'sections' => array_map(fn (string $key) => [
                'key' => $key,
                'title' => 'Judul '.$key,
                'body' => '<p>Pengantar misi.</p>',
                'media_id' => null,
            ], ProfileSection::KEYS),
        ]));

    expect(ProfileSection::query()->where('key', 'visi')->value('body'))
        ->toBe('Pengantar misi.')
        // The rich-text sections are unaffected.
        ->and(ProfileSection::query()->where('key', 'sambutan')->value('body'))
        ->toContain('<p>');

    get(route('profil'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sections.2.body', 'Pengantar misi.'));
});

test('markup already stored on the visi row is stripped on the way out', function () {
    // A row written before the section became plain text must not be able to
    // break the live page.
    ProfileSection::query()->where('key', 'visi')->update([
        'body' => '<p>Warisan lama.</p>',
    ]);

    get(route('profil'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sections.2.body', 'Warisan lama.'));
});

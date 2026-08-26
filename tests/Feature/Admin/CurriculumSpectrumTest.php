<?php

use App\Models\CurriculumSpectrum;
use App\Models\CurriculumSubject;
use App\Models\User;
use App\Support\PageVisibility;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// Spektrum kurikulum — berdiri sendiri, tidak terikat tabel majors.

function spectrumPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Kurikulum Merdeka',
        'description' => 'Struktur kurikulum yang berlaku tahun ini.',
        'sort_order' => 0,
        'is_active' => true,
        'subjects' => [
            ['group' => 'Mata Pelajaran Umum', 'name' => 'Pendidikan Pancasila'],
            ['group' => 'Mata Pelajaran Umum', 'name' => 'Bahasa Indonesia'],
            ['group' => 'Mata Pelajaran Kejuruan', 'name' => 'Projek IPAS'],
        ],
    ], $overrides);
}

// prd-05 §2 — editorial content, so both roles.

test('an editor can manage spectra', function () {
    actingAs(User::factory()->create())
        ->get(route('admin.curriculum-spectra.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/curriculum-spectra/index')
            ->has('spectra', 0)
            ->where('enabled', true)
        );
});

test('a spectrum is stored with its subjects in submitted order', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload())
        ->assertRedirect(route('admin.curriculum-spectra.index'));

    $spectrum = CurriculumSpectrum::query()->firstOrFail();

    expect($spectrum->name)->toBe('Kurikulum Merdeka')
        ->and($spectrum->slug)->toBe('kurikulum-merdeka')
        ->and($spectrum->subjects()->ordered()->pluck('name')->all())
        ->toBe(['Pendidikan Pancasila', 'Bahasa Indonesia', 'Projek IPAS'])
        ->and($spectrum->subjects()->ordered()->pluck('sort_order')->all())
        ->toBe([0, 1, 2]);
});

test('more than one spectrum may be published at once', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload());
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload([
            'name' => 'Kurikulum 2013',
            'sort_order' => 1,
        ]));

    expect(CurriculumSpectrum::query()->publicList()->count())->toBe(2);

    get(route('spektrum'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/spektrum-kurikulum')
            ->has('spectra', 2)
            ->where('spectra.0.name', 'Kurikulum Merdeka')
            ->where('spectra.1.name', 'Kurikulum 2013')
        );
});

test('subjects are grouped by kelompok for the public page', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload());

    get(route('spektrum'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('spectra.0.groups', 2)
            ->where('spectra.0.groups.0.label', 'Mata Pelajaran Umum')
            ->where('spectra.0.groups.0.subjects', [
                'Pendidikan Pancasila',
                'Bahasa Indonesia',
            ])
            ->where('spectra.0.groups.1.label', 'Mata Pelajaran Kejuruan')
        );
});

test('an inactive spectrum is kept off the public page', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload([
            'is_active' => false,
        ]));

    get(route('spektrum'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('spectra', 0));
});

test('editing rewrites the subject list wholesale', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload());

    $spectrum = CurriculumSpectrum::query()->firstOrFail();

    actingAs(User::factory()->create())
        ->put(route('admin.curriculum-spectra.update', $spectrum), spectrumPayload([
            'subjects' => [['group' => '', 'name' => 'Informatika']],
        ]));

    expect(CurriculumSubject::query()->count())->toBe(1)
        ->and(CurriculumSubject::query()->value('name'))->toBe('Informatika')
        // A blank kelompok is stored as null so the page renders one flat list.
        ->and(CurriculumSubject::query()->value('group'))->toBeNull();
});

test('a subject row without a name is rejected', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload([
            'subjects' => [['group' => 'Umum', 'name' => '']],
        ]))
        ->assertSessionHasErrors('subjects.0.name');

    expect(CurriculumSpectrum::query()->count())->toBe(0);
});

test('deleting a spectrum takes its subjects with it', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.curriculum-spectra.store'), spectrumPayload());

    $spectrum = CurriculumSpectrum::query()->firstOrFail();

    actingAs(User::factory()->create())
        ->delete(route('admin.curriculum-spectra.destroy', $spectrum));

    expect(CurriculumSpectrum::query()->count())->toBe(0)
        ->and(CurriculumSubject::query()->count())->toBe(0);
});

// Toggle halaman publik.

test('switching the page off 404s it and drops it from the sitemap', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.curriculum-spectra.visibility'), ['enabled' => false])
        ->assertRedirect(route('admin.curriculum-spectra.index'));

    expect(PageVisibility::enabled('spektrum'))->toBeFalse();

    get(route('spektrum'))->assertNotFound();
    get('/sitemap.xml')->assertDontSee('/profil/spektrum-kurikulum', false);
});

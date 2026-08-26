<?php

use App\Models\Extracurricular;
use App\Models\Major;
use Database\Seeders\SchoolContentSeeder;

use function Pest\Laravel\seed;

// The school's real jurusan and ekstrakurikuler, not demo fixtures.

test('the seeder creates the school jurusan in order', function () {
    seed(SchoolContentSeeder::class);

    expect(Major::query()->publicList()->pluck('name')->all())->toBe([
        'Teknik Pemesinan',
        'Teknik Mekanik Industri',
        'Teknik Kendaraan Ringan',
        'Teknik Pengelasan',
        'Rekayasa Perangkat Lunak',
    ])->and(Major::query()->where('slug', 'teknik-pemesinan')->exists())->toBeTrue();
});

test('the seeder creates the school ekstrakurikuler in order', function () {
    seed(SchoolContentSeeder::class);

    expect(Extracurricular::query()->publicList()->pluck('name')->all())->toBe([
        'Paskibra',
        'PMR',
        'Sepak Bola',
        'Futsal',
        'Voli',
        'LED Community',
        'English Club',
        'Nihongo Club',
        'KIRA',
    ])
        ->and(Extracurricular::query()->where('slug', 'led-community')->value('description'))
        ->toBe('<p>Komunitas belajar coding</p>')
        // No description supplied means null, not empty markup — the card then
        // renders with just its name.
        ->and(Extracurricular::query()->where('slug', 'paskibra')->value('description'))
        ->toBeNull();
});

test('running it twice does not duplicate a single row', function () {
    seed(SchoolContentSeeder::class);
    seed(SchoolContentSeeder::class);

    expect(Major::withTrashed()->count())->toBe(5)
        ->and(Extracurricular::withTrashed()->count())->toBe(9);
});

test('a re-run restores ordering without overwriting CMS edits', function () {
    seed(SchoolContentSeeder::class);

    Major::query()->where('slug', 'teknik-pemesinan')->update([
        'excerpt' => 'Ditulis sekolah lewat CMS.',
        'sort_order' => 99,
        'is_active' => false,
    ]);

    seed(SchoolContentSeeder::class);

    $major = Major::query()->withoutGlobalScopes()->where('slug', 'teknik-pemesinan')->firstOrFail();

    // Place in the list is restored; the school's own copy is not touched.
    expect($major->sort_order)->toBe(0)
        ->and($major->is_active)->toBeTrue()
        ->and($major->excerpt)->toBe('Ditulis sekolah lewat CMS.');
});

test('the seeded jurusan reach the public site and the sitemap', function () {
    seed(SchoolContentSeeder::class);

    $this->get(route('majors.index'))->assertOk();
    $this->get(route('majors.show', 'rekayasa-perangkat-lunak'))->assertOk();
    $this->get('/sitemap.xml')->assertSee('/jurusan/rekayasa-perangkat-lunak', false);
});

test('the seeded ekstrakurikuler reach the public page', function () {
    seed(SchoolContentSeeder::class);

    $this->get(route('ekskul'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('extracurriculars', 9));
});

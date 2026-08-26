<?php

use App\Models\SchoolIdentity;
use App\Support\PageVisibility;
use Inertia\Testing\AssertableInertia;

test('identitas renders the filled fields grouped as the form declares them', function () {
    SchoolIdentity::put('nama_sekolah', 'SMK PGRI Telagasari');
    SchoolIdentity::put('jenjang_pendidikan', 'SMK');
    SchoolIdentity::put('status_sekolah', 'Swasta');
    SchoolIdentity::put('nomor_telepon', '(0267) 123456');

    $this->get(route('identitas'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/identitas')
            ->where('groups.0.label', 'A. Identitas Sekolah')
            ->where('groups.0.rows.0.label', 'Nama Sekolah')
            ->where('groups.0.rows.0.value', 'SMK PGRI Telagasari')
            ->where('seo.title', 'Identitas Sekolah')
        );
});

// "Jika terdapat field yang kosong jangan tampilkan pada public."

test('a blank field never reaches the page, and an all-blank group is absent', function () {
    SchoolIdentity::query()->delete();
    SchoolIdentity::put('nama_sekolah', 'SMK PGRI Telagasari');
    SchoolIdentity::put('npsn', '');
    SchoolIdentity::put('kecamatan', '   ');

    $this->get(route('identitas'))
        ->assertInertia(function (AssertableInertia $page) {
            $groups = $page->toArray()['props']['groups'];
            $labels = [];

            foreach ($groups as $group) {
                foreach ($group['rows'] as $row) {
                    $labels[] = $row['label'];
                }
            }

            // Neither the empty NPSN nor the whitespace-only kecamatan makes
            // it through, so kelompok B disappears entirely with them.
            expect($labels)->toBe(['Nama Sekolah'])
                ->and($groups)->toHaveCount(1);
        });
});

test('paired fields collapse into one row when both are filled', function () {
    SchoolIdentity::put('npsn', '20217999');
    SchoolIdentity::put('nss', '344022115001');
    SchoolIdentity::put('rt', '01');

    $this->get(route('identitas'))
        ->assertInertia(function (AssertableInertia $page) {
            $groups = collect($page->toArray()['props']['groups'])
                ->keyBy('label');

            expect($groups['A. Identitas Sekolah']['rows'][0])
                ->toBe(['label' => 'NPSN / NSS', 'value' => '20217999 / 344022115001'])
                // RW is blank, so RT keeps its own label rather than pairing.
                ->and($groups['B. Lokasi Sekolah']['rows'][0])
                ->toBe(['label' => 'RT', 'value' => '01']);
        });
});

test('the page 404s once it is switched off', function () {
    PageVisibility::set('identitas', false);

    $this->get(route('identitas'))
        ->assertNotFound()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/error')
            ->where('status', 404)
        );
});

test('a switched-off page is dropped from the sitemap', function () {
    $this->get('/sitemap.xml')->assertSee('/profil/identitas', false);

    PageVisibility::set('identitas', false);

    $this->get('/sitemap.xml')->assertDontSee('/profil/identitas', false);
});

test('every page is on until someone turns it off', function () {
    expect(PageVisibility::all())->toBe([
        'identitas' => true,
        'spektrum' => true,
        'gallery' => true,
        'ekskul' => true,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.pages.identitas', true));
});

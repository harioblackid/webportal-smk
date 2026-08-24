<?php

use App\Models\Hero;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// US-013 — editor hero halaman depan.

function heroPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Selamat Datang',
        'subtitle' => 'SMK PGRI Telagasari',
        'media_id' => null,
        'cta1_text' => 'Info PPDB',
        'cta1_url' => 'https://ppdb.example.test',
        'cta2_text' => '',
        'cta2_url' => '',
        'is_active' => true,
    ], $overrides);
}

test('an editor creates a hero with its call to action', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload())
        ->assertRedirect(route('admin.heroes.index'));

    $hero = Hero::query()->sole();

    expect($hero->title)->toBe('Selamat Datang')
        ->and($hero->cta1_url)->toBe('https://ppdb.example.test')
        ->and($hero->is_active)->toBeTrue();
});

// FR5-13 — hanya 1 hero aktif pada satu waktu.

test('activating a hero deactivates every other one', function () {
    $previous = Hero::factory()->active()->create();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload());

    expect($previous->refresh()->is_active)->toBeFalse()
        ->and(Hero::query()->where('is_active', true)->count())->toBe(1);
});

test('saving a hero as inactive leaves the active one alone', function () {
    $active = Hero::factory()->active()->create();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload(['is_active' => false]));

    expect($active->refresh()->is_active)->toBeTrue();
});

// FR5-14 / US-013 — "Perubahan langsung tampil di Home tanpa deploy".

test('the home page shows the hero saved from the CMS', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload(['title' => 'Ayo Sekolah di SMK']));

    get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hero.title', 'Ayo Sekolah di SMK')
            ->has('hero.ctas', 1));
});

test('a hero can be edited and deleted', function () {
    $hero = Hero::factory()->create();
    $editor = User::factory()->create();

    actingAs($editor)
        ->put(route('admin.heroes.update', $hero), heroPayload(['title' => 'Judul Baru']))
        ->assertRedirect(route('admin.heroes.index'));

    expect($hero->refresh()->title)->toBe('Judul Baru');

    actingAs($editor)->delete(route('admin.heroes.destroy', $hero));

    expect(Hero::query()->count())->toBe(0);
});

// FR4-2 keeps a labelled button that goes nowhere off the home page.

test('a call to action label without a url is rejected', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload([
            'cta1_text' => 'Daftar',
            'cta1_url' => '',
        ]))
        ->assertSessionHasErrors('cta1_url');

    expect(Hero::query()->count())->toBe(0);
});

<?php

use App\Models\Hero;
use App\Models\Post;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// US-013 — editor hero halaman depan, kini berupa carousel.

function heroPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Selamat Datang',
        'subtitle' => 'SMK PGRI Telagasari',
        'media_id' => null,
        'post_id' => null,
        'post_link_text' => '',
        'cta1_text' => 'Info PPDB',
        'cta1_url' => 'https://ppdb.example.test',
        'cta2_text' => '',
        'cta2_url' => '',
        'is_active' => true,
        'sort_order' => 0,
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

// FR5-13's "only one active hero" was retired on the school's instruction:
// several are active at once and become carousel slides.

test('several heroes may be active at the same time', function () {
    $previous = Hero::factory()->active()->create();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload());

    expect($previous->refresh()->is_active)->toBeTrue()
        ->and(Hero::query()->active()->count())->toBe(2);
});

test('the slide budget is enforced on the server', function () {
    Hero::factory()->active()->count(Hero::MAX_ACTIVE)->create();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload())
        ->assertSessionHasErrors('is_active');

    expect(Hero::query()->active()->count())->toBe(Hero::MAX_ACTIVE);
});

test('an inactive hero may still be saved once the budget is full', function () {
    Hero::factory()->active()->count(Hero::MAX_ACTIVE)->create();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload(['is_active' => false]))
        ->assertRedirect(route('admin.heroes.index'));

    expect(Hero::query()->count())->toBe(Hero::MAX_ACTIVE + 1);
});

test('editing an already-active hero does not count it twice', function () {
    $heroes = Hero::factory()->active()->count(Hero::MAX_ACTIVE)->create();

    actingAs(User::factory()->create())
        ->put(route('admin.heroes.update', $heroes->first()), heroPayload([
            'title' => 'Judul Baru',
        ]))
        ->assertSessionHasNoErrors();

    expect($heroes->first()->refresh()->title)->toBe('Judul Baru');
});

// FR5-14 / US-013 — "Perubahan langsung tampil di Home tanpa deploy".

test('the home page shows the heroes saved from the CMS, in sort order', function () {
    $editor = User::factory()->create();

    actingAs($editor)->post(route('admin.heroes.store'), heroPayload([
        'title' => 'Slide kedua',
        'sort_order' => 5,
    ]));
    actingAs($editor)->post(route('admin.heroes.store'), heroPayload([
        'title' => 'Slide pertama',
        'sort_order' => 1,
    ]));

    get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('heroes', 2)
            ->where('heroes.0.title', 'Slide pertama')
            ->where('heroes.1.title', 'Slide kedua')
            ->has('heroes.0.ctas', 1));
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

// Tautan berita: tombol "Lihat selengkapnya".

test('a hero linked to a berita gets a link straight to it', function () {
    $post = Post::factory()->published()->create(['slug' => 'kabar-baru']);

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload(['post_id' => $post->id]));

    get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('heroes.0.postUrl', route('posts.show', 'kabar-baru'))
            ->where('heroes.0.postLinkText', Hero::DEFAULT_POST_LINK_TEXT));
});

test('the link label can be overridden per slide', function () {
    $post = Post::factory()->published()->create();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload([
            'post_id' => $post->id,
            'post_link_text' => 'Baca pengumuman',
        ]));

    get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('heroes.0.postLinkText', 'Baca pengumuman'));
});

// FR7-2 — a slide must never leak a berita that is not published.

test('a hero pointing at a draft berita carries no link', function () {
    $draft = Post::factory()->create(['status' => 'draft', 'published_at' => null]);

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload(['post_id' => $draft->id]));

    get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('heroes.0.postUrl', null)
            ->where('heroes.0.postLinkText', null));
});

test('a hero pointing at a withdrawn berita carries no link', function () {
    $post = Post::factory()->published()->create();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload(['post_id' => $post->id]));

    // Soft delete: the nullOnDelete foreign key does not fire, so the guard in
    // Hero::postUrl() is the only thing preventing a dead link.
    $post->delete();

    get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('heroes.0.postUrl', null));
});

test('a hero cannot be linked to a berita that was deleted', function () {
    $post = Post::factory()->published()->create();
    $post->delete();

    actingAs(User::factory()->create())
        ->post(route('admin.heroes.store'), heroPayload(['post_id' => $post->id]))
        ->assertSessionHasErrors('post_id');
});

test('the form offers only published berita', function () {
    Post::factory()->published()->create(['title' => 'Sudah terbit']);
    Post::factory()->create(['status' => 'draft', 'published_at' => null]);

    actingAs(User::factory()->create())
        ->get(route('admin.heroes.create'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('posts', 1)
            ->where('posts.0.title', 'Sudah terbit')
            ->where('defaultPostLinkText', Hero::DEFAULT_POST_LINK_TEXT));
});

<?php

use App\Models\Hero;
use App\Models\Media;
use App\Models\Post;
use App\Models\Setting;
use Inertia\Testing\AssertableInertia;

test('the hero comes from the CMS when one is active', function () {
    // US-005: title, subtitle, image, and CTAs all originate in the CMS.
    $media = Media::factory()->create(['alt' => 'Gerbang sekolah']);

    Hero::factory()->active()->create([
        'title' => 'Selamat datang di SMK PGRI Telagasari',
        'subtitle' => 'Kejuruan yang siap kerja',
        'media_id' => $media->id,
        'cta1_text' => 'Daftar PPDB',
        'cta1_url' => 'https://ppdb.example.test',
        'cta2_text' => null,
        'cta2_url' => null,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/home')
            ->where('hero.title', 'Selamat datang di SMK PGRI Telagasari')
            ->where('hero.subtitle', 'Kejuruan yang siap kerja')
            ->where('hero.image.alt', 'Gerbang sekolah')
            // The half-filled second CTA is dropped rather than rendered blank.
            ->count('hero.ctas', 1)
            ->where('hero.ctas.0.text', 'Daftar PPDB')
        );
});

test('an inactive hero is not shown', function () {
    Hero::factory()->create(['is_active' => false]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('hero', null));
});

test('home renders without error when no hero is active', function () {
    // FR4-2: the fallback is the page's job, so the prop is simply null.
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/home')
            ->where('hero', null)
        );
});

test('home lists the six newest published posts', function () {
    Post::factory()->count(8)->published()->create();
    Post::factory()->count(2)->create(); // drafts

    $newest = Post::factory()->published()->create([
        'title' => 'Berita paling baru',
        'published_at' => now(),
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->count('posts', 6)
            ->where('posts.0.title', $newest->title)
            ->has('posts.0.category.name')
            ->has('posts.0.publishedAtLabel')
        );
});

test('the ppdb banner is off until both the switch and the url are set', function () {
    // US-009: a banner without a destination is worse than no banner.
    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('site.ppdb.enabled', false));

    Setting::put('ppdb_enabled', '1');

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('site.ppdb.enabled', false));

    Setting::put('ppdb_url', 'https://ppdb.example.test');

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.ppdb.enabled', true)
            ->where('site.ppdb.url', 'https://ppdb.example.test')
        );
});

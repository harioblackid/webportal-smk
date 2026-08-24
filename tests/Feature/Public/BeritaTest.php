<?php

use App\Models\Category;
use App\Models\Media;
use App\Models\Post;
use Inertia\Testing\AssertableInertia;

test('the list shows only published posts, newest first', function () {
    $old = Post::factory()->published()->create(['published_at' => now()->subWeek()]);
    $new = Post::factory()->published()->create(['published_at' => now()->subHour()]);
    $draft = Post::factory()->create(['title' => 'Draf rahasia']);

    $this->get(route('posts.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/berita/index')
            ->count('posts.data', 2)
            ->where('posts.data.0.title', $new->title)
            ->where('posts.data.1.title', $old->title)
        )
        ->assertDontSee($draft->title);
});

test('a post scheduled for the future is not public yet', function () {
    Post::factory()->create([
        'status' => 'published',
        'published_at' => now()->addDay(),
        'title' => 'Terbit besok',
    ]);

    $this->get(route('posts.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->count('posts.data', 0));
});

test('the list paginates twelve per page and keeps the page in the url', function () {
    Post::factory()->count(14)->published()->create();

    $this->get(route('posts.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->count('posts.data', 12)
            ->where('posts.total', 14)
            ->where('posts.last_page', 2)
            ->where('posts.current_page', 1)
        );

    $this->get(route('posts.index').'?page=2')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->count('posts.data', 2)
            ->where('posts.current_page', 2)
        );
});

test('the category url filters the list', function () {
    $category = Category::factory()->create(['name' => 'Prestasi', 'slug' => 'prestasi']);
    $wanted = Post::factory()->published()->create(['category_id' => $category->id]);
    $other = Post::factory()->published()->create();

    $this->get(route('posts.category', 'prestasi'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/berita/index')
            ->count('posts.data', 1)
            ->where('posts.data.0.title', $wanted->title)
            ->where('activeCategory.name', 'Prestasi')
        )
        ->assertDontSee($other->title);
});

test('an unknown category slug is a 404', function () {
    $this->get('/berita/kategori/tidak-ada')->assertNotFound();
});

test('only categories that have published posts are offered as filters', function () {
    $used = Category::factory()->create(['name' => 'Terpakai']);
    Category::factory()->create(['name' => 'Kosong']);
    Post::factory()->published()->create(['category_id' => $used->id]);

    $this->get(route('posts.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->count('categories', 1)
            ->where('categories.0.name', 'Terpakai')
        );
});

test('the empty state has no posts to show', function () {
    $this->get(route('posts.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->count('posts.data', 0));
});

test('a published post is reachable by slug with its full payload', function () {
    $media = Media::factory()->create(['alt' => 'Foto kegiatan']);
    $post = Post::factory()->published()->create([
        'title' => 'Pengumuman Libur Semester',
        'slug' => 'pengumuman-libur-semester',
        'excerpt' => 'Jadwal libur semester ganjil.',
        'body' => '<p>Isi pengumuman.</p>',
        'featured_media_id' => $media->id,
    ]);

    $this->get(route('posts.show', $post->slug))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/berita/show')
            ->where('post.title', 'Pengumuman Libur Semester')
            ->where('post.body', '<p>Isi pengumuman.</p>')
            ->where('post.image.alt', 'Foto kegiatan')
            ->has('post.category.name')
            ->has('post.publishedAtLabel')
        );
});

test('a draft post is a 404, not a hidden page', function () {
    // FR4-12 — indistinguishable from a URL that never existed.
    $draft = Post::factory()->create(['slug' => 'draf-belum-terbit']);

    $this->get(route('posts.show', $draft->slug))
        ->assertNotFound()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/error')
            ->where('status', 404)
        );
});

test('the detail page offers other posts to read', function () {
    $category = Category::factory()->create();
    $post = Post::factory()->published()->create(['category_id' => $category->id]);
    Post::factory()->count(2)->published()->create(['category_id' => $category->id]);
    Post::factory()->count(2)->published()->create();

    $this->get(route('posts.show', $post->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page->count('related', 3));
});

test('related posts fall back to the newest when the category is thin', function () {
    $post = Post::factory()->published()->create();
    Post::factory()->count(4)->published()->create();

    $this->get(route('posts.show', $post->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->count('related', 3)
            ->where('related.0.id', fn (int $id) => $id !== $post->id)
        );
});

test('the detail page describes itself with the post title and excerpt', function () {
    // FR6-3 / FR6-5 via the seo prop SeoHead renders.
    $media = Media::factory()->create();
    $post = Post::factory()->published()->create([
        'title' => 'Juara Lomba Kompetensi Siswa',
        'excerpt' => 'Siswa RPL membawa pulang medali.',
        'featured_media_id' => $media->id,
    ]);

    $this->get(route('posts.show', $post->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('seo.title', 'Juara Lomba Kompetensi Siswa')
            ->where('seo.description', 'Siswa RPL membawa pulang medali.')
            ->where('seo.type', 'article')
            ->has('seo.image.url')
        );
});

test('a post without an excerpt falls back to its body for the description', function () {
    $post = Post::factory()->published()->create([
        'excerpt' => null,
        'body' => '<p>Kalimat pertama isi berita.</p>',
    ]);

    $this->get(route('posts.show', $post->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('seo.description', 'Kalimat pertama isi berita.')
        );
});

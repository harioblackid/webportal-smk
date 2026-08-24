<?php

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

// US-011 — CRUD berita dengan rich text & status.

function postPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Peringatan Hari Guru',
        'slug' => '',
        'category_id' => null,
        'featured_media_id' => null,
        'excerpt' => 'Upacara dan lomba antarkelas.',
        'body' => '<p>Isi berita.</p>',
        'type' => 'berita',
        'status' => 'draft',
        'published_at' => null,
    ], $overrides);
}

test('an editor creates a draft with a slug derived from the title', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), postPayload())
        ->assertRedirect(route('admin.posts.index'));

    $post = Post::query()->sole();

    expect($post->slug)->toBe('peringatan-hari-guru')
        ->and($post->status)->toBe('draft')
        // A draft has no publication date, which is what keeps it out of
        // scopePublished.
        ->and($post->published_at)->toBeNull();
});

// FR5-1 — Editors publish directly, with no approval step in between.

test('an editor publishes directly and the post appears on the public site', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), postPayload(['status' => 'published']))
        ->assertRedirect(route('admin.posts.index'));

    $post = Post::query()->sole();

    expect($post->published_at)->not->toBeNull();

    $this->get(route('posts.show', $post->slug))->assertOk();
});

test('the author is recorded from the signed-in user', function () {
    $editor = User::factory()->create();

    actingAs($editor)->post(route('admin.posts.store'), postPayload());

    expect(Post::query()->sole()->user_id)->toBe($editor->id);
});

// FR5-10 — slug wajib unik; sistem mencegah bentrok.

test('a colliding slug gets a numeric suffix instead of failing', function () {
    Post::factory()->create(['slug' => 'peringatan-hari-guru']);

    actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), postPayload());

    expect(Post::query()->latest('id')->first()?->slug)
        ->toBe('peringatan-hari-guru-2');
});

test('a soft-deleted post still reserves its slug', function () {
    // The unique index counts deleted rows, so reusing the slug would be a
    // database error rather than a friendly suffix.
    Post::factory()->create(['slug' => 'peringatan-hari-guru'])->delete();

    actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), postPayload());

    expect(Post::query()->latest('id')->first()?->slug)
        ->toBe('peringatan-hari-guru-2');
});

test('a post keeps its slug when the title is edited', function () {
    $post = Post::factory()->create(['slug' => 'kabar-lama']);

    actingAs(User::factory()->create())
        ->put(route('admin.posts.update', $post), postPayload([
            'title' => 'Judul Yang Berubah',
            'slug' => 'kabar-lama',
        ]));

    expect($post->refresh()->slug)->toBe('kabar-lama');
});

// FR5-9 — isi HTML tersanitasi.

test('script tags in the body never reach the database', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), postPayload([
            'body' => '<p>Halo</p><script>alert(1)</script>',
        ]));

    expect(Post::query()->sole()->body)
        ->toBe('<p>Halo</p>')
        ->not->toContain('script');
});

test('event handler attributes and javascript urls are stripped', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), postPayload([
            'body' => '<p onclick="steal()">Teks</p>'
                .'<a href="javascript:alert(1)">Tautan</a>',
        ]));

    $body = Post::query()->sole()->body;

    expect($body)
        ->not->toContain('onclick')
        ->not->toContain('javascript:')
        // The link itself survives, only its dangerous target is dropped.
        ->toContain('Tautan');
});

// FR5-11 — hapus memakai soft delete.

test('deleting a post soft deletes it and takes it off the public site', function () {
    $post = Post::factory()->published()->create();

    actingAs(User::factory()->create())
        ->delete(route('admin.posts.destroy', $post))
        ->assertRedirect(route('admin.posts.index'));

    expect(Post::withTrashed()->count())->toBe(1)
        ->and(Post::query()->count())->toBe(0);

    $this->get(route('posts.show', $post->slug))->assertNotFound();
});

// FR5-7 — pencarian & filter status.

test('the list filters by search term and by status', function () {
    Post::factory()->published()->create(['title' => 'PPDB dibuka']);
    Post::factory()->create(['title' => 'Rapat guru']);

    actingAs(User::factory()->create())
        ->get(route('admin.posts.index', ['q' => 'PPDB']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/posts/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'PPDB dibuka'));

    actingAs(User::factory()->create())
        ->get(route('admin.posts.index', ['status' => 'draft']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Rapat guru'));
});

test('the form receives the categories it has to offer', function () {
    Category::factory()->create(['name' => 'Prestasi']);

    actingAs(User::factory()->create())
        ->get(route('admin.posts.create'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/posts/form')
            ->where('post', null)
            ->has('categories', 1)
            ->has('mediaLibrary'));
});

test('a post without a title is rejected', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.posts.store'), postPayload(['title' => '']))
        ->assertSessionHasErrors('title');

    expect(Post::query()->count())->toBe(0);
});

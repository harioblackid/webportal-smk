<?php

use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Models\Media;
use App\Models\User;
use App\Support\PageVisibility;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// Galeri foto — album berisi foto dari media library yang sudah ada.

function albumPayload(array $overrides = []): array
{
    $media = Media::factory()->count(2)->create();

    return array_merge([
        'title' => 'Ujian Kompetensi Keahlian',
        'description' => 'Dokumentasi pelaksanaan UKK.',
        'cover_media_id' => $media[0]->id,
        'sort_order' => 0,
        'is_active' => true,
        'items' => [
            ['media_id' => $media[0]->id, 'caption' => 'Persiapan'],
            ['media_id' => $media[1]->id, 'caption' => ''],
        ],
    ], $overrides);
}

test('an editor can manage albums', function () {
    actingAs(User::factory()->create())
        ->get(route('admin.gallery-albums.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/gallery-albums/index')
            ->has('albums', 0)
            ->where('enabled', true)
        );
});

test('an album is stored with its photos in submitted order', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.gallery-albums.store'), albumPayload())
        ->assertRedirect(route('admin.gallery-albums.index'));

    $album = GalleryAlbum::query()->firstOrFail();

    expect($album->slug)->toBe('ujian-kompetensi-keahlian')
        ->and($album->items()->ordered()->pluck('sort_order')->all())->toBe([0, 1])
        ->and($album->items()->ordered()->first()->caption)->toBe('Persiapan')
        // Blank caption becomes null, so the page has one empty state to test.
        ->and($album->items()->ordered()->get()->last()->caption)->toBeNull();
});

test('the public index lists active albums with their photo counts', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.gallery-albums.store'), albumPayload());

    get(route('gallery.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/galeri/index')
            ->has('albums', 1)
            ->where('albums.0.title', 'Ujian Kompetensi Keahlian')
            ->where('albums.0.photoCount', 2)
        );
});

test('an album page shows its photos', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.gallery-albums.store'), albumPayload());

    $album = GalleryAlbum::query()->firstOrFail();

    get(route('gallery.show', $album->slug))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/galeri/show')
            ->where('album.title', 'Ujian Kompetensi Keahlian')
            ->has('photos', 2)
            ->where('photos.0.caption', 'Persiapan')
        );
});

// FR4-21 — an inactive album is a 404, never a page that admits it exists.

test('an inactive album is hidden from the index and 404s on its own url', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.gallery-albums.store'), albumPayload([
            'is_active' => false,
        ]));

    $album = GalleryAlbum::withTrashed()->firstOrFail();

    get(route('gallery.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('albums', 0));

    get(route('gallery.show', $album->slug))->assertNotFound();
    get('/sitemap.xml')->assertDontSee('/galeri/'.$album->slug, false);
});

test('a photo row without an image is rejected', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.gallery-albums.store'), albumPayload([
            'items' => [['media_id' => null, 'caption' => 'Tanpa gambar']],
        ]))
        ->assertSessionHasErrors('items.0.media_id');

    expect(GalleryAlbum::query()->count())->toBe(0);
});

test('deleting an album is a soft delete and keeps the photos in media', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.gallery-albums.store'), albumPayload());

    $album = GalleryAlbum::query()->firstOrFail();

    actingAs(User::factory()->create())
        ->delete(route('admin.gallery-albums.destroy', $album));

    expect(GalleryAlbum::query()->count())->toBe(0)
        ->and(GalleryAlbum::withTrashed()->count())->toBe(1)
        // Soft delete leaves the join rows alone; the images were never owned
        // by the album to begin with.
        ->and(Media::query()->count())->toBe(2)
        ->and(GalleryItem::query()->count())->toBe(2);
});

// Toggle halaman publik.

test('switching the page off 404s both gallery routes', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.gallery-albums.store'), albumPayload());

    $album = GalleryAlbum::query()->firstOrFail();

    actingAs(User::factory()->create())
        ->put(route('admin.gallery-albums.visibility'), ['enabled' => false])
        ->assertRedirect(route('admin.gallery-albums.index'));

    expect(PageVisibility::enabled('gallery'))->toBeFalse();

    get(route('gallery.index'))->assertNotFound();
    get(route('gallery.show', $album->slug))->assertNotFound();
    get('/sitemap.xml')->assertDontSee('/galeri', false);
});

<?php

use App\Models\Category;
use App\Models\Post;
use App\Models\User;

use function Pest\Laravel\actingAs;

// US-012 — kelola kategori berita.

test('an editor creates a category with a slug derived from the name', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.categories.store'), ['name' => 'Prestasi Siswa', 'slug' => ''])
        ->assertRedirect(route('admin.categories.index'));

    expect(Category::query()->sole()->slug)->toBe('prestasi-siswa');
});

test('a duplicate category slug is suffixed rather than rejected', function () {
    Category::factory()->create(['slug' => 'prestasi-siswa']);

    actingAs(User::factory()->create())
        ->post(route('admin.categories.store'), ['name' => 'Prestasi Siswa']);

    expect(Category::query()->latest('id')->first()?->slug)
        ->toBe('prestasi-siswa-2');
});

test('a category can be renamed', function () {
    $category = Category::factory()->create(['name' => 'Umum']);

    actingAs(User::factory()->create())
        ->put(route('admin.categories.update', $category), [
            'name' => 'Pengumuman Sekolah',
            'slug' => 'pengumuman-sekolah',
        ])
        ->assertRedirect(route('admin.categories.index'));

    expect($category->refresh()->name)->toBe('Pengumuman Sekolah')
        ->and($category->slug)->toBe('pengumuman-sekolah');
});

test('an unused category can be deleted', function () {
    $category = Category::factory()->create();

    actingAs(User::factory()->create())
        ->delete(route('admin.categories.destroy', $category));

    expect(Category::query()->count())->toBe(0);
});

// US-012 — "Kategori yang dipakai tidak bisa dihapus sembarangan".

test('a category still used by a post is kept, with an explanation', function () {
    $category = Category::factory()->create();
    Post::factory()->create(['category_id' => $category->id]);

    actingAs(User::factory()->create())
        ->delete(route('admin.categories.destroy', $category))
        ->assertSessionHas('error');

    expect(Category::query()->count())->toBe(1);
});

test('a soft-deleted post still counts as usage', function () {
    // Restoring the post later would otherwise resurrect a dangling category
    // reference.
    $category = Category::factory()->create();
    Post::factory()->create(['category_id' => $category->id])->delete();

    actingAs(User::factory()->create())
        ->delete(route('admin.categories.destroy', $category))
        ->assertSessionHas('error');

    expect(Category::query()->count())->toBe(1);
});

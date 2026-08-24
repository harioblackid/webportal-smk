<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Hero;
use App\Models\Major;
use App\Models\Media;
use App\Models\Post;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

// US-022 — skema inti.

test('every core table from prd-07 §2 exists', function () {
    foreach ([
        'users',
        'categories',
        'posts',
        'media',
        'heroes',
        'majors',
        'settings',
    ] as $table) {
        expect(Schema::hasTable($table))->toBeTrue("missing table: {$table}");
    }
});

test('soft deletes are active on users and posts', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    $user->delete();
    $post->delete();

    expect(User::query()->find($user->id))->toBeNull()
        ->and(User::withTrashed()->find($user->id))->not->toBeNull()
        ->and(Post::query()->find($post->id))->toBeNull()
        ->and(Post::withTrashed()->find($post->id))->not->toBeNull();
});

test('post foreign keys null out instead of cascading', function () {
    // FR7-4 / prd-07 §3.3: deleting an author or a category must not take the
    // article with it.
    $category = Category::factory()->create();
    $author = User::factory()->create();
    $media = Media::factory()->create();

    $post = Post::factory()->create([
        'category_id' => $category->id,
        'user_id' => $author->id,
        'featured_media_id' => $media->id,
    ]);

    $category->forceDelete();
    $author->forceDelete();
    $media->delete();

    $post->refresh();

    expect($post->category_id)->toBeNull()
        ->and($post->user_id)->toBeNull()
        ->and($post->featured_media_id)->toBeNull();
});

test('slugs are unique on posts, categories, and majors', function (string $model, array $attributes) {
    $model::factory()->create($attributes);

    expect(fn () => $model::factory()->create($attributes))
        ->toThrow(QueryException::class);
})->with([
    'posts' => [Post::class, ['slug' => 'berita-yang-sama']],
    'categories' => [Category::class, ['slug' => 'kategori-yang-sama']],
    'majors' => [Major::class, ['slug' => 'jurusan-yang-sama']],
]);

test('settings keys are unique and readable by key', function () {
    Setting::put('school_name', 'SMK PGRI Telagasari');
    Setting::put('school_name', 'SMK PGRI Telagasari (revisi)');

    expect(Setting::query()->where('key', 'school_name')->count())->toBe(1)
        ->and(Setting::get('school_name'))->toBe('SMK PGRI Telagasari (revisi)')
        ->and(Setting::get('tidak_ada', 'bawaan'))->toBe('bawaan');
});

test('a user carries one of the two roles from prd-05 §2', function () {
    expect(User::factory()->create()->role)->toBe(UserRole::Editor)
        ->and(User::factory()->superadmin()->create()->isSuperadmin())->toBeTrue()
        ->and(User::factory()->create()->isSuperadmin())->toBeFalse();
});

test('published scope hides drafts and future posts', function () {
    Post::factory()->published()->create();
    Post::factory()->create(); // draft
    Post::factory()->create([
        'status' => 'published',
        'published_at' => now()->addWeek(),
    ]);

    expect(Post::query()->published()->count())->toBe(1);
});

// US-031 — majors.

test('the public majors query filters on is_active and orders by sort_order', function () {
    $third = Major::factory()->create(['sort_order' => 30]);
    $first = Major::factory()->create(['sort_order' => 10]);
    $second = Major::factory()->create(['sort_order' => 20]);
    Major::factory()->inactive()->create(['sort_order' => 5]);

    $slugs = Major::query()->publicList()->pluck('slug')->all();

    expect($slugs)->toBe([$first->slug, $second->slug, $third->slug]);
});

test('majors soft delete and resolve routes by slug', function () {
    $major = Major::factory()->create();

    expect($major->getRouteKeyName())->toBe('slug');

    $major->delete();

    expect(Major::query()->find($major->id))->toBeNull()
        ->and(Major::withTrashed()->find($major->id))->not->toBeNull();
});

test('majors carry the FR7-9 composite index and a media foreign key', function () {
    $indexes = collect(Schema::getIndexes('majors'))
        ->map(fn (array $index) => $index['columns'])
        ->all();

    expect($indexes)->toContain(['is_active', 'sort_order'])
        ->and($indexes)->toContain(['slug']);

    $foreignColumns = collect(Schema::getForeignKeys('majors'))
        ->flatMap(fn (array $key) => $key['columns'])
        ->all();

    expect($foreignColumns)->toContain('media_id');
});

test('posts carry the FR7-3 composite index', function () {
    $indexes = collect(Schema::getIndexes('posts'))
        ->map(fn (array $index) => $index['columns'])
        ->all();

    expect($indexes)->toContain(['status', 'published_at'])
        ->and($indexes)->toContain(['slug']);
});

test('hero and major images point at media', function () {
    $media = Media::factory()->create();
    $hero = Hero::factory()->active()->create(['media_id' => $media->id]);
    $major = Major::factory()->create(['media_id' => $media->id]);

    expect($hero->media?->is($media))->toBeTrue()
        ->and($major->media?->is($media))->toBeTrue()
        ->and(Hero::query()->active()->count())->toBe(1);
});

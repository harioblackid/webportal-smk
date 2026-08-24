<?php

use App\Models\Major;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// US-030 — modul CMS Jurusan, khusus Superadmin.

function majorPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Teknik Komputer dan Jaringan',
        'slug' => '',
        'excerpt' => 'Jaringan, server, dan perangkat keras.',
        'description' => '<p>Deskripsi lengkap.</p>',
        'extra' => '',
        'media_id' => null,
        'sort_order' => 1,
        'is_active' => true,
    ], $overrides);
}

// FR5-15a — Editor mendapat 403 di setiap verb, bukan sekadar menu tersembunyi.

test('an editor is refused on the jurusan list and create form', function () {
    $editor = User::factory()->create();

    actingAs($editor)->get(route('admin.majors.index'))->assertForbidden();
    actingAs($editor)->get(route('admin.majors.create'))->assertForbidden();
    actingAs($editor)->post(route('admin.majors.store'), majorPayload())->assertForbidden();

    expect(Major::query()->count())->toBe(0);
});

test('an editor is refused on the jurusan edit, update, and delete routes', function () {
    $major = Major::factory()->create();
    $editor = User::factory()->create();

    actingAs($editor)->get(route('admin.majors.edit', $major))->assertForbidden();
    actingAs($editor)->put(route('admin.majors.update', $major), majorPayload())->assertForbidden();
    actingAs($editor)->delete(route('admin.majors.destroy', $major))->assertForbidden();

    // The refusal is real, not cosmetic: nothing changed.
    expect(Major::query()->count())->toBe(1);
});

test('a superadmin creates a jurusan with a slug derived from the name', function () {
    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.majors.store'), majorPayload())
        ->assertRedirect(route('admin.majors.index'));

    $major = Major::query()->sole();

    expect($major->slug)->toBe('teknik-komputer-dan-jaringan')
        ->and($major->is_active)->toBeTrue()
        ->and($major->sort_order)->toBe(1);
});

// FR5-15c — slug wajib unik.

test('a colliding jurusan slug gets a numeric suffix', function () {
    Major::factory()->create(['slug' => 'teknik-komputer-dan-jaringan']);

    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.majors.store'), majorPayload());

    expect(Major::query()->latest('id')->first()?->slug)
        ->toBe('teknik-komputer-dan-jaringan-2');
});

// FR5-15c / FR5-15e — hanya jurusan aktif tampil, dan langsung.

test('a saved jurusan shows up on the public listing straight away', function () {
    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.majors.store'), majorPayload(['name' => 'Akuntansi Keuangan']));

    get(route('majors.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('majors', 1)
            ->where('majors.0.name', 'Akuntansi Keuangan'));
});

test('an inactive jurusan is kept off the public site', function () {
    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.majors.store'), majorPayload(['is_active' => false]));

    $major = Major::query()->sole();

    get(route('majors.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('majors', 0));

    get(route('majors.show', $major->slug))->assertNotFound();
});

test('the rich text description is sanitised', function () {
    actingAs(User::factory()->superadmin()->create())
        ->post(route('admin.majors.store'), majorPayload([
            'description' => '<p>Aman</p><script>alert(1)</script>',
        ]));

    expect(Major::query()->sole()->description)->toBe('<p>Aman</p>');
});

// FR5-15d — hapus memakai soft delete.

test('deleting a jurusan soft deletes it', function () {
    $major = Major::factory()->create();

    actingAs(User::factory()->superadmin()->create())
        ->delete(route('admin.majors.destroy', $major))
        ->assertRedirect(route('admin.majors.index'));

    expect(Major::withTrashed()->count())->toBe(1)
        ->and(Major::query()->count())->toBe(0);
});

test('the sort order decides the public order', function () {
    $superadmin = User::factory()->superadmin()->create();

    actingAs($superadmin)->post(route('admin.majors.store'), majorPayload([
        'name' => 'Kedua',
        'sort_order' => 2,
    ]));
    actingAs($superadmin)->post(route('admin.majors.store'), majorPayload([
        'name' => 'Pertama',
        'sort_order' => 1,
    ]));

    get(route('majors.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('majors.0.name', 'Pertama')
            ->where('majors.1.name', 'Kedua'));
});

test('the create form suggests the next sort order', function () {
    Major::factory()->create(['sort_order' => 4]);

    actingAs(User::factory()->superadmin()->create())
        ->get(route('admin.majors.create'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/majors/form')
            ->where('nextSortOrder', 5));
});

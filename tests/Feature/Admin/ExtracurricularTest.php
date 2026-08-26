<?php

use App\Models\Extracurricular;
use App\Models\User;
use App\Support\PageVisibility;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// Ekstrakurikuler — satu halaman daftar, tanpa route detail.

function ekskulPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Pramuka',
        'description' => '<p>Latihan kepemimpinan dan kemandirian.</p>',
        'pembina' => 'Kak Rina',
        'jadwal' => 'Jumat, 14.00-16.00',
        'media_id' => null,
        'sort_order' => 0,
        'is_active' => true,
    ], $overrides);
}

test('an editor can manage extracurriculars', function () {
    actingAs(User::factory()->create())
        ->get(route('admin.extracurriculars.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/extracurriculars/index')
            ->has('extracurriculars', 0)
            ->where('enabled', true)
        );
});

test('an extracurricular is stored and reaches the public list', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload())
        ->assertRedirect(route('admin.extracurriculars.index'));

    expect(Extracurricular::query()->value('slug'))->toBe('pramuka');

    get(route('ekskul'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/ekstrakurikuler/index')
            ->has('extracurriculars', 1)
            ->where('extracurriculars.0.name', 'Pramuka')
            ->where('extracurriculars.0.pembina', 'Kak Rina')
            ->where('extracurriculars.0.jadwal', 'Jumat, 14.00-16.00')
        );
});

test('the list follows sort_order', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload([
            'name' => 'Futsal',
            'sort_order' => 5,
        ]));
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload([
            'name' => 'Paskibra',
            'sort_order' => 1,
        ]));

    get(route('ekskul'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('extracurriculars.0.name', 'Paskibra')
            ->where('extracurriculars.1.name', 'Futsal')
        );
});

test('an inactive extracurricular stays off the public list', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload([
            'is_active' => false,
        ]));

    get(route('ekskul'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('extracurriculars', 0));
});

// FR5-9 — rich text is stored sanitised, never raw.

test('script in the description never reaches the database', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload([
            'description' => '<p>Aman</p><script>alert(1)</script>',
        ]));

    expect(Extracurricular::query()->value('description'))
        ->not->toContain('<script')
        ->toContain('Aman');
});

test('a blank description is stored as null rather than empty markup', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload([
            'description' => '',
        ]));

    expect(Extracurricular::query()->value('description'))->toBeNull();
});

test('a name is required', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload(['name' => '']))
        ->assertSessionHasErrors('name');
});

test('deleting is a soft delete', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.extracurriculars.store'), ekskulPayload());

    $item = Extracurricular::query()->firstOrFail();

    actingAs(User::factory()->create())
        ->delete(route('admin.extracurriculars.destroy', $item));

    expect(Extracurricular::query()->count())->toBe(0)
        ->and(Extracurricular::withTrashed()->count())->toBe(1);
});

// Toggle halaman publik.

test('switching the page off 404s it and drops it from the sitemap', function () {
    actingAs(User::factory()->create())
        ->put(route('admin.extracurriculars.visibility'), ['enabled' => false])
        ->assertRedirect(route('admin.extracurriculars.index'));

    expect(PageVisibility::enabled('ekskul'))->toBeFalse();

    get(route('ekskul'))->assertNotFound();
    get('/sitemap.xml')->assertDontSee('/ekstrakurikuler', false);
});

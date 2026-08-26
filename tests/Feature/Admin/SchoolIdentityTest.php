<?php

use App\Models\SchoolIdentity;
use App\Models\User;
use App\Support\SchoolIdentityFields;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

// Identitas sekolah (Superadmin) — tabel school_id.

function identityPayload(array $overrides = []): array
{
    $payload = [];

    foreach (SchoolIdentityFields::keys() as $key) {
        $payload[$key] = '';
    }

    return array_merge($payload, [
        'nama_sekolah' => 'SMK PGRI Telagasari',
        'jenjang_pendidikan' => 'SMK',
        'status_sekolah' => 'Swasta',
        'alamat' => 'Jalan Raya Telagasari',
        'status_kepemilikan' => 'Yayasan',
        'nomor_telepon' => '(0267) 123456',
        'email' => 'info@smkpgritelagasari.sch.id',
        'waktu_penyelenggaraan' => 'Full Time',
    ], $overrides);
}

// FR5-2 — server-side enforcement, not a hidden menu item.

test('an editor cannot reach the identity page or save it', function () {
    $editor = User::factory()->create();

    actingAs($editor)->get(route('admin.school-identity.edit'))->assertForbidden();
    actingAs($editor)
        ->put(route('admin.school-identity.update'), identityPayload())
        ->assertForbidden();

    expect(SchoolIdentity::query()->where('key', 'nama_sekolah')->count())->toBe(0);
});

test('a superadmin saves the identity record', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.school-identity.update'), identityPayload([
            'npsn' => '20217999',
            'kecamatan' => 'Telagasari',
        ]))
        ->assertRedirect(route('admin.school-identity.edit'));

    expect(SchoolIdentity::get('nama_sekolah'))->toBe('SMK PGRI Telagasari')
        ->and(SchoolIdentity::get('npsn'))->toBe('20217999')
        ->and(SchoolIdentity::get('kecamatan'))->toBe('Telagasari');
});

test('the required fields are rejected when left blank', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.school-identity.update'), identityPayload([
            'nama_sekolah' => '',
            'alamat' => '',
            'nomor_telepon' => '',
            'email' => '',
        ]))
        ->assertSessionHasErrors(['nama_sekolah', 'alamat', 'nomor_telepon', 'email']);
});

test('a choice outside the allowed list is rejected', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.school-identity.update'), identityPayload([
            'jenjang_pendidikan' => 'MTs',
            'waktu_penyelenggaraan' => '3 Shift',
        ]))
        ->assertSessionHasErrors(['jenjang_pendidikan', 'waktu_penyelenggaraan']);
});

test('a cleared optional field is stored as null, not an empty string', function () {
    SchoolIdentity::put('npsn', '20217999');

    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.school-identity.update'), identityPayload(['npsn' => '']));

    expect(SchoolIdentity::get('npsn'))->toBeNull();
});

test('the form is generated from the field catalogue and prefilled', function () {
    SchoolIdentity::put('nama_sekolah', 'SMK PGRI Telagasari');

    actingAs(User::factory()->superadmin()->create())
        ->get(route('admin.school-identity.edit'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/school-identity/edit')
            ->has('groups', 5)
            ->where('groups.0.label', 'A. Identitas Sekolah')
            ->where('values.nama_sekolah', 'SMK PGRI Telagasari')
        );
});

// The identity record is what the shared `site` prop reports, so a save here
// changes the header, footer, and JSON-LD on the very next request.

test('identity changes reach every public page immediately', function () {
    actingAs(User::factory()->superadmin()->create())
        ->put(route('admin.school-identity.update'), identityPayload([
            'nama_sekolah' => 'SMK PGRI Telagasari',
            'email' => 'humas@example.test',
            'nomor_telepon' => '0267123456',
        ]));

    get(route('home'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.name', 'SMK PGRI Telagasari')
            ->where('site.contact.email', 'humas@example.test')
            ->where('site.contact.phoneHref', 'tel:0267123456')
        );
});

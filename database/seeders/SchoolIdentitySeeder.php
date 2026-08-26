<?php

namespace Database\Seeders;

use App\Models\SchoolIdentity;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * The `school_id` record a fresh install would otherwise be missing entirely.
 *
 * The create-school_id migration only carries over the four keys that used to
 * live in `settings`, so on a database that never had them the table comes out
 * holding a single `sumber_listrik` row. SiteSettings::share() reads the name,
 * address, phone, and email from here, which means the header, the footer, and
 * the JSON-LD all render blank until something writes them.
 *
 * Only facts the brief actually states are seeded. NPSN, NSS, alamat, telepon,
 * email, akreditasi, luas tanah, and the coordinates are real-world records
 * this repository does not hold — inventing them would put fabricated figures
 * on a public school page, so they stay absent and the Superadmin fills them in
 * at /admin/school-identity. The Identitas page already renders a missing field
 * as not-yet-filled.
 */
class SchoolIdentitySeeder extends Seeder
{
    use WithoutModelEvents;

    /** @var array<string, string> */
    private const IDENTITY = [
        'nama_sekolah' => 'SMK PGRI Telagasari',
        'jenjang_pendidikan' => 'SMK',
        'status_sekolah' => 'Swasta',
        'kecamatan' => 'Telagasari',
        'kabupaten_kota' => 'Karawang',
    ];

    /**
     * Insert-if-absent, never update.
     *
     * The release script runs `db:seed --force` on every deploy, so a seeder
     * that wrote unconditionally would erase whatever the school had corrected
     * in the CMS each time — including the `sumber_listrik` the migration
     * already inserted.
     */
    public function run(): void
    {
        foreach (self::IDENTITY as $key => $value) {
            SchoolIdentity::query()->firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}

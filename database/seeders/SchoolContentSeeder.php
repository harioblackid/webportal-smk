<?php

namespace Database\Seeders;

use App\Models\Extracurricular;
use App\Models\Major;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * The school's real program keahlian and ekstrakurikuler.
 *
 * The school's own content, supplied by them — not sample data, and not
 * something a later release may overwrite.
 *
 * Names only. Excerpt, description, and photos are left null on purpose —
 * writing marketing copy for a real jurusan would mean inventing claims about
 * a school, and the public pages already treat a missing description as a
 * normal state. The school fills those in from /admin.
 *
 * Idempotent by slug: a re-run refreshes ordering and activation without
 * duplicating rows or overwriting copy that has since been edited in the CMS.
 */
class SchoolContentSeeder extends Seeder
{
    use WithoutModelEvents;

    /** @var list<string> */
    private const MAJORS = [
        'Teknik Pemesinan',
        'Teknik Mekanik Industri',
        'Teknik Kendaraan Ringan',
        'Teknik Pengelasan',
        'Rekayasa Perangkat Lunak',
    ];

    /**
     * name => description. Null where the school gave no description; those
     * render as a card with just the name until someone fills them in.
     *
     * @var array<string, string|null>
     */
    private const EXTRACURRICULARS = [
        'Paskibra' => null,
        'PMR' => null,
        'Sepak Bola' => null,
        'Futsal' => null,
        'Voli' => null,
        'LED Community' => 'Komunitas belajar coding',
        'English Club' => 'Komunitas belajar bahasa Inggris',
        'Nihongo Club' => 'Komunitas belajar bahasa Jepang',
        'KIRA' => 'Komunitas belajar multimedia',
    ];

    public function run(): void
    {
        foreach (self::MAJORS as $index => $name) {
            // Str::slug, not Slug::unique: the latter appends a suffix once the
            // slug is taken, so a second run would look up a slug that cannot
            // exist and insert a duplicate row every time. These names are
            // fixed and distinct, so the plain slug is the stable key.
            $major = Major::withTrashed()->firstOrNew(['slug' => Str::slug($name)]);

            // Only on first insert: a re-run must not undo an edit made in the
            // CMS, only restore the row's place in the list.
            if (! $major->exists) {
                $major->name = $name;
            }

            $major->sort_order = $index;
            $major->is_active = true;
            $major->deleted_at = null;
            $major->save();
        }

        $index = 0;

        foreach (self::EXTRACURRICULARS as $name => $description) {
            $item = Extracurricular::withTrashed()->firstOrNew([
                'slug' => Str::slug($name),
            ]);

            if (! $item->exists) {
                $item->name = $name;
                $item->description = $description === null
                    ? null
                    : '<p>'.e($description).'</p>';
            }

            $item->sort_order = $index++;
            $item->is_active = true;
            $item->deleted_at = null;
            $item->save();
        }
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Identitas sekolah — the Dapodik-style record (NPSN, akreditasi, luas tanah)
 * the CMS had nowhere to put.
 *
 * Same key/value shape as `settings`, deliberately in its own table: these are
 * facts about the institution that outlive any one site configuration, and the
 * public Identitas page renders the whole table rather than named keys.
 *
 * The four identity values that used to live in `settings` move here in the
 * same migration, so there is never a moment where both tables claim to own
 * the school's name or address.
 */
return new class extends Migration
{
    /** settings key => school_id key. */
    private const MOVED = [
        'school_name' => 'nama_sekolah',
        'contact_address' => 'alamat',
        'contact_phone' => 'nomor_telepon',
        'contact_email' => 'email',
    ];

    public function up(): void
    {
        Schema::create('school_id', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        $now = now();
        $rows = [];

        foreach (self::MOVED as $from => $to) {
            $value = DB::table('settings')->where('key', $from)->value('value');

            if ($value !== null && trim((string) $value) !== '') {
                $rows[] = ['key' => $to, 'value' => $value, 'created_at' => $now, 'updated_at' => $now];
            }
        }

        // The spec states this one as a given rather than a blank to fill.
        $rows[] = ['key' => 'sumber_listrik', 'value' => 'PLN', 'created_at' => $now, 'updated_at' => $now];

        DB::table('school_id')->insert($rows);
        DB::table('settings')->whereIn('key', array_keys(self::MOVED))->delete();
    }

    public function down(): void
    {
        $now = now();

        foreach (self::MOVED as $to => $from) {
            $value = DB::table('school_id')->where('key', $from)->value('value');

            if ($value !== null) {
                DB::table('settings')->updateOrInsert(
                    ['key' => $to],
                    ['value' => $value, 'created_at' => $now, 'updated_at' => $now],
                );
            }
        }

        Schema::dropIfExists('school_id');
    }
};

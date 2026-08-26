<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Halaman Visi Misi — the Profil copy that used to be a constant in
 * resources/js/pages/public/profil.tsx.
 *
 * Sections are a fixed set rather than a page builder: the public page lays
 * each one out with its own AstroWind widget (Content for the prose blocks,
 * Steps for the misi list), and a free-form section would have nothing to
 * render itself with. Misi is the one part that varies in length, so it gets
 * its own table.
 *
 * The rows are seeded here with the wording the page already shipped, so the
 * page is never blank between the migration and the school's first edit.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profile_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('title', 200);
            $table->longText('body')->nullable();
            $table->foreignId('media_id')
                ->nullable()
                ->constrained('media')
                ->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('profile_missions', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('sort_order');
        });

        $now = now();

        DB::table('profile_sections')->insert(array_map(
            fn (array $row) => $row + ['created_at' => $now, 'updated_at' => $now],
            self::sections(),
        ));

        DB::table('profile_missions')->insert(array_map(
            fn (array $row) => $row + ['created_at' => $now, 'updated_at' => $now],
            self::missions(),
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_missions');
        Schema::dropIfExists('profile_sections');
    }

    /**
     * PLACEHOLDER, carried over verbatim from the page it replaces: structural
     * draft copy that states no date, no name, and no figure, precisely so no
     * invented fact goes out under the school's name.
     *
     * @return list<array<string, string>>
     */
    private static function sections(): array
    {
        return [
            [
                'key' => 'sambutan',
                'title' => 'Sambutan kepala sekolah',
                'body' => '<blockquote><p>Selamat datang di portal resmi SMK PGRI Telagasari. '
                    .'Kami percaya pendidikan kejuruan bukan sekadar mengajarkan keterampilan, '
                    .'melainkan menyiapkan peserta didik untuk melangkah percaya diri ke dunia '
                    .'kerja maupun pendidikan lanjut.</p></blockquote>'
                    .'<p>Melalui laman ini kami membuka informasi sekolah seluas-luasnya bagi '
                    .'calon peserta didik dan orang tua: program keahlian yang tersedia, kegiatan '
                    .'sekolah, serta cara menghubungi kami. Semoga informasi di sini membantu '
                    .'Anda mengambil keputusan terbaik.</p>'
                    .'<p><strong>Kepala SMK PGRI Telagasari</strong></p>',
            ],
            [
                'key' => 'sejarah',
                'title' => 'Sejarah singkat',
                'body' => '<p>SMK PGRI Telagasari berdiri dan berkembang sebagai bagian dari '
                    .'ikhtiar Persatuan Guru Republik Indonesia untuk memperluas akses pendidikan '
                    .'kejuruan di lingkungan Telagasari dan sekitarnya.</p>'
                    .'<p>Sejak awal, sekolah berfokus pada penyelenggaraan program keahlian yang '
                    .'relevan dengan kebutuhan masyarakat sekitar, dengan penekanan pada praktik '
                    .'dan pembentukan karakter kerja.</p>',
            ],
            [
                'key' => 'visi',
                'title' => 'Menjadi SMK yang menghasilkan lulusan berkarakter, kompeten, dan siap bersaing',
                'body' => '<p>Visi itu diterjemahkan ke dalam misi berikut.</p>',
            ],
            [
                'key' => 'yayasan',
                'title' => 'Identitas yayasan',
                'body' => '<p>SMK PGRI Telagasari berada di bawah naungan <strong>YPLP Dasar '
                    .'Menengah PGRI</strong>, badan penyelenggara satuan pendidikan dasar dan '
                    .'menengah di lingkungan Persatuan Guru Republik Indonesia.</p>',
            ],
        ];
    }

    /**
     * @return list<array<string, string|int>>
     */
    private static function missions(): array
    {
        $missions = [
            ['Pembelajaran kejuruan yang relevan', 'Menyelenggarakan pembelajaran yang selaras dengan kebutuhan dunia kerja.'],
            ['Karakter dan kedisiplinan', 'Menumbuhkan karakter, kedisiplinan, dan sikap profesional pada setiap peserta didik.'],
            ['Guru yang terus berkembang', 'Mengembangkan kompetensi guru dan tenaga kependidikan secara berkelanjutan.'],
            ['Kemitraan dengan industri', 'Menjalin kemitraan dengan dunia usaha dan dunia industri untuk praktik dan penyaluran lulusan.'],
        ];

        return array_map(
            fn (int $index, array $mission) => [
                'title' => $mission[0],
                'description' => $mission[1],
                'sort_order' => $index,
            ],
            array_keys($missions),
            $missions,
        );
    }
};

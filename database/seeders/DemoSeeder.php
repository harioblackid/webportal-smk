<?php

namespace Database\Seeders;

use App\Console\Commands\DemoImagesCommand;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Hero;
use App\Models\Major;
use App\Models\Media;
use App\Models\Post;
use App\Models\Setting;
use App\Models\User;
use App\Support\ImageProcessor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Fills the site with image-bearing demo content so the UI can actually be
 * measured: without a real hero photo there is no LCP element to time, and the
 * berita grid cannot be judged on a page of empty placeholder boxes.
 *
 * Deliberately NOT wired into DatabaseSeeder — production must never run this.
 * Run it explicitly, and undo it with `php artisan demo:clear`.
 *
 * Everything it creates is idempotent and marked: post slugs and media
 * filenames carry the {@see self::MARKER} prefix, so a second run updates
 * rather than duplicates, and the cleanup command knows exactly what to remove.
 */
class DemoSeeder extends Seeder
{
    use WithoutModelEvents;

    /** Prefixes demo post slugs and demo media filenames. */
    public const MARKER = 'demo-';

    /** Demo accounts live on this domain so `demo:clear` can find them. */
    public const SUPERADMIN = 'superadmin@demo.test';

    public const EDITOR = 'editor@demo.test';

    /** A fixture credential, not a secret — these accounts only exist locally. */
    public const PASSWORD = 'password';

    /**
     * The stored `maps_embed` held a truncated `pb=` blob that Google answers
     * with HTTP 400, so /kontak shipped a broken iframe. Only Google can mint a
     * valid `pb=`; the keyless `output=embed` form needs no API key and works.
     */
    public const MAPS_EMBED = 'https://www.google.com/maps?q=SMK+PGRI+Telagasari+Karawang&output=embed';

    /** Where the pre-change state is parked so `demo:clear` can put it back. */
    public const SNAPSHOT = DemoImagesCommand::DIRECTORY.'/.original-refs.json';

    /**
     * Alt text is content, not decoration (AD-3), so it is written by hand
     * rather than derived from the filename.
     *
     * @var array<string, string>
     */
    private const ALT = [
        'hero-utama' => 'Siswa SMK berseragam sedang belajar bersama di lingkungan sekolah',
        'ppdb-banner' => 'Siswa baru mengikuti kegiatan pengenalan sekolah',
        'jurusan-rekayasa-perangkat-lunak' => 'Siswa menulis kode program di laboratorium komputer',
        'jurusan-teknik-komputer-dan-jaringan' => 'Siswa merakit dan menguji perangkat jaringan komputer',
        'jurusan-akuntansi-dan-keuangan-lembaga' => 'Siswa mengerjakan pembukuan keuangan di kelas praktik',
        'jurusan-cadangan' => 'Ruang praktik komputer sekolah',
        'berita-01' => 'Kegiatan belajar mengajar di dalam kelas',
        'berita-02' => 'Siswa mengikuti upacara di halaman sekolah',
        'berita-03' => 'Siswa berdiskusi kelompok di ruang kelas',
        'berita-04' => 'Guru mendampingi siswa mengerjakan tugas',
        'berita-05' => 'Siswa membaca buku di perpustakaan sekolah',
        'berita-06' => 'Siswa mengikuti kegiatan praktik di laboratorium',
        'berita-07' => 'Siswa berkegiatan di halaman sekolah',
        'berita-08' => 'Siswa mengikuti pelajaran dengan tekun',
        'berita-09' => 'Suasana kelas saat jam pelajaran berlangsung',
        'berita-10' => 'Siswa mengerjakan latihan soal di kelas',
        'berita-11' => 'Kegiatan ekstrakurikuler siswa di sekolah',
        'berita-12' => 'Siswa menerima penghargaan di sekolah',
        'berita-13' => 'Siswa bekerja sama dalam tugas kelompok',
        'berita-14' => 'Siswa mengikuti kegiatan pembelajaran praktik',
        'berita-15' => 'Guru menjelaskan materi di depan kelas',
        'berita-16' => 'Siswa mempersiapkan kegiatan sekolah',
    ];

    /**
     * The berita added on top of whatever the CMS already holds.
     *
     * @var array<int, array{title: string, category: string, type: string, excerpt: string}>
     */
    private const POSTS = [
        [
            'title' => 'Penerimaan Peserta Didik Baru Tahun Ajaran Baru Resmi Dibuka',
            'category' => 'pengumuman',
            'type' => 'pengumuman',
            'excerpt' => 'Pendaftaran peserta didik baru dibuka secara daring. Simak jadwal, syarat berkas, dan alur seleksinya.',
        ],
        [
            'title' => 'Siswa RPL Raih Juara Lomba Kompetensi Siswa Tingkat Kabupaten',
            'category' => 'prestasi',
            'type' => 'berita',
            'excerpt' => 'Tim Rekayasa Perangkat Lunak membawa pulang medali emas setelah bersaing dengan puluhan sekolah lain.',
        ],
        [
            'title' => 'Kunjungan Industri ke Perusahaan Teknologi untuk Siswa Kelas XI',
            'category' => 'kegiatan',
            'type' => 'berita',
            'excerpt' => 'Siswa melihat langsung alur kerja pengembangan perangkat lunak dan berdiskusi dengan praktisi.',
        ],
        [
            'title' => 'Jadwal Ujian Tengah Semester dan Ketentuan Pelaksanaannya',
            'category' => 'pengumuman',
            'type' => 'pengumuman',
            'excerpt' => 'Ujian berlangsung selama satu pekan. Peserta wajib membawa kartu ujian dan hadir lima belas menit lebih awal.',
        ],
        [
            'title' => 'Pelatihan Jaringan Komputer Bersertifikat untuk Siswa TKJ',
            'category' => 'kegiatan',
            'type' => 'berita',
            'excerpt' => 'Program pelatihan intensif membekali siswa dengan keterampilan konfigurasi jaringan yang diakui industri.',
        ],
        [
            'title' => 'Peringatan Hari Pendidikan Nasional di Lingkungan Sekolah',
            'category' => 'kegiatan',
            'type' => 'berita',
            'excerpt' => 'Upacara dan rangkaian lomba antarkelas digelar untuk memperingati Hari Pendidikan Nasional.',
        ],
        [
            'title' => 'Siswa AKL Juara Olimpiade Akuntansi Tingkat Provinsi',
            'category' => 'prestasi',
            'type' => 'berita',
            'excerpt' => 'Prestasi ini melengkapi rangkaian capaian siswa jurusan Akuntansi dan Keuangan Lembaga tahun ini.',
        ],
        [
            'title' => 'Program Praktik Kerja Lapangan Angkatan Baru Segera Dimulai',
            'category' => 'pengumuman',
            'type' => 'pengumuman',
            'excerpt' => 'Siswa kelas XII akan ditempatkan di berbagai mitra industri selama tiga bulan ke depan.',
        ],
    ];

    public function run(): void
    {
        $author = $this->author();
        $media = $this->importMedia($author);

        $this->snapshot();

        $this->fillHero($media);
        $this->fillMajors($media);
        $this->fillSettings($media);
        $this->fillExistingPosts($media);
        $this->createPosts($media, $author);
    }

    /**
     * Two accounts with known passwords, because the browser suite has to log in
     * as each role to prove the FR5-2 split (an Editor must get 403, not a
     * hidden button). Existing accounts are left alone — their passwords are
     * not knowable from code, which is exactly why these exist.
     */
    private function author(): User
    {
        $superadmin = $this->account(
            self::SUPERADMIN,
            'Superadmin Demo',
            UserRole::Superadmin,
        );

        $this->account(self::EDITOR, 'Editor Demo', UserRole::Editor);

        return $superadmin;
    }

    private function account(string $email, string $name, UserRole $role): User
    {
        $user = User::withTrashed()->firstOrNew(['email' => $email]);

        $user->fill([
            'name' => $name,
            'password' => Hash::make(self::PASSWORD),
            'role' => $role,
            'email_verified_at' => now(),
        ]);
        $user->deleted_at = null;
        $user->save();

        return $user;
    }

    /**
     * Pushes every cached photo through the real upload pipeline, so the rows
     * and their derivatives are indistinguishable from a genuine CMS upload — a
     * fixture that bypassed ImageProcessor would not exercise it.
     *
     * @return array<string, Media>
     */
    private function importMedia(User $author): array
    {
        $disk = Storage::disk('local');
        $imported = [];

        foreach (array_keys(DemoImagesCommand::PHOTOS) as $slug) {
            $filename = self::MARKER.$slug.'.'.DemoImagesCommand::EXTENSION;
            $existing = Media::query()->where('filename', $filename)->first();

            if ($existing !== null) {
                $imported[$slug] = $existing;

                continue;
            }

            $source = $disk->path(
                DemoImagesCommand::DIRECTORY.'/'.$slug.'.'.DemoImagesCommand::EXTENSION
            );

            if (! is_file($source)) {
                throw new RuntimeException(
                    "Foto demo belum diunduh: {$slug}. Jalankan `php artisan demo:images` lebih dulu."
                );
            }

            $imported[$slug] = $this->store($source, $filename, self::ALT[$slug], $author);
        }

        $imported['logo'] = $this->logo($author);

        return $imported;
    }

    /** The crest is the school's own asset, never a stock photo. */
    private function logo(User $author): Media
    {
        $filename = self::MARKER.'logo-smk.png';
        $existing = Media::query()->where('filename', $filename)->first();

        if ($existing !== null) {
            return $existing;
        }

        return $this->store(
            public_path('logo-smk.png'),
            $filename,
            'Logo SMK PGRI Telagasari',
            $author
        );
    }

    private function store(string $source, string $filename, string $alt, User $author): Media
    {
        $stored = ImageProcessor::store(new UploadedFile($source, $filename, null, null, true));

        return Media::query()->create([
            ...$stored,
            'filename' => $filename,
            'alt' => $alt,
            'uploaded_by' => $author->id,
        ]);
    }

    /**
     * Records what the site pointed at before this seeder touched anything, so
     * `demo:clear` restores the exact previous state instead of leaving nulls
     * behind. Written once: a second run must not overwrite the real baseline
     * with the already-seeded one.
     */
    private function snapshot(): void
    {
        $disk = Storage::disk('local');

        if ($disk->exists(self::SNAPSHOT)) {
            return;
        }

        $disk->put(self::SNAPSHOT, (string) json_encode([
            'heroes' => Hero::query()->pluck('media_id', 'id')->all(),
            'majors' => Major::withTrashed()->pluck('media_id', 'id')->all(),
            'posts' => Post::withTrashed()->pluck('featured_media_id', 'id')->all(),
            'settings' => [
                'logo_media_id' => Setting::get('logo_media_id'),
                'ppdb_banner_media_id' => Setting::get('ppdb_banner_media_id'),
                'maps_embed' => Setting::get('maps_embed'),
            ],
        ], JSON_PRETTY_PRINT));
    }

    /** @param  array<string, Media>  $media */
    private function fillHero(array $media): void
    {
        $hero = Hero::query()->where('is_active', true)->first()
            ?? Hero::query()->orderBy('id')->first();

        if ($hero === null) {
            Hero::query()->create([
                'title' => 'Belajar kejuruan, siap melangkah',
                'subtitle' => 'SMK PGRI Telagasari membekali siswa dengan keterampilan yang terpakai di dunia kerja.',
                'media_id' => $media['hero-utama']->id,
                'cta1_text' => 'Lihat Jurusan',
                'cta1_url' => '/jurusan',
                'cta2_text' => 'Hubungi Kami',
                'cta2_url' => '/kontak',
                'is_active' => true,
            ]);

            return;
        }

        $hero->update(['media_id' => $media['hero-utama']->id]);
    }

    /** @param  array<string, Media>  $media */
    private function fillMajors(array $media): void
    {
        foreach (Major::withTrashed()->get() as $major) {
            $photo = $media['jurusan-'.$major->slug] ?? $media['jurusan-cadangan'];

            $major->update(['media_id' => $photo->id]);
        }
    }

    /** @param  array<string, Media>  $media */
    private function fillSettings(array $media): void
    {
        Setting::put('logo_media_id', (string) $media['logo']->id);
        Setting::put('ppdb_banner_media_id', (string) $media['ppdb-banner']->id);
        Setting::put('maps_embed', self::MAPS_EMBED);
    }

    /**
     * Fills posts that have no image, and replaces the degenerate ones.
     *
     * A row whose thumb_path IS its path never went through ImageProcessor —
     * the "thumbnail" is the full-size file, so every card in the berita grid
     * downloads a display-sized image. That is a real performance defect on the
     * exact page perf.spec.ts measures, so those count as unfilled too.
     *
     * A post carrying a genuine editor-chosen image is left alone.
     *
     * @param  array<string, Media>  $media
     */
    private function fillExistingPosts(array $media): void
    {
        $photos = $this->beritaPhotos($media);
        $index = 0;

        $degenerate = Media::query()
            ->whereColumn('thumb_path', 'path')
            ->pluck('id');

        $posts = Post::withTrashed()
            ->whereNull('featured_media_id')
            ->orWhereIn('featured_media_id', $degenerate)
            ->orderBy('id')
            ->get();

        foreach ($posts as $post) {
            $post->update(['featured_media_id' => $photos[$index % count($photos)]->id]);
            $index++;
        }
    }

    /** @param  array<string, Media>  $media */
    private function createPosts(array $media, User $author): void
    {
        $photos = $this->beritaPhotos($media);

        foreach (self::POSTS as $index => $post) {
            $slug = self::MARKER.str($post['title'])->slug()->value();

            $category = Category::query()->firstOrCreate(
                ['slug' => $post['category']],
                ['name' => str($post['category'])->title()->value()],
            );

            Post::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'user_id' => $author->id,
                    'title' => $post['title'],
                    'excerpt' => $post['excerpt'],
                    'body' => $this->body($post['excerpt']),
                    'featured_media_id' => $photos[($index + 8) % count($photos)]->id,
                    'type' => $post['type'],
                    'status' => 'published',
                    // Spread out so the "6 newest" block on Home has a stable order.
                    'published_at' => now()->subDays($index + 1),
                ],
            );
        }
    }

    /**
     * @param  array<string, Media>  $media
     * @return array<int, Media>
     */
    private function beritaPhotos(array $media): array
    {
        $photos = [];

        foreach ($media as $slug => $photo) {
            if (str_starts_with($slug, 'berita-')) {
                $photos[] = $photo;
            }
        }

        return $photos;
    }

    /** Long enough that the prose styles and reading width are worth looking at. */
    private function body(string $excerpt): string
    {
        return '<p>'.e($excerpt).'</p>'
            .'<p>Kegiatan ini merupakan bagian dari upaya sekolah meningkatkan mutu pembelajaran '
            .'sekaligus mempererat hubungan antara siswa, guru, dan orang tua. Seluruh rangkaian '
            .'acara berjalan lancar dan mendapat sambutan baik dari warga sekolah.</p>'
            .'<h2>Rangkaian kegiatan</h2>'
            .'<p>Panitia menyiapkan agenda yang melibatkan seluruh tingkatan kelas, mulai dari '
            .'persiapan hingga evaluasi. Setiap jurusan menampilkan kegiatan sesuai bidang '
            .'keahliannya masing-masing.</p>'
            .'<ul><li>Persiapan dan gladi bersih</li><li>Pelaksanaan kegiatan inti</li>'
            .'<li>Evaluasi dan dokumentasi</li></ul>'
            .'<p>Sekolah berterima kasih kepada seluruh pihak yang telah mendukung '
            .'terselenggaranya kegiatan ini dengan baik.</p>';
    }
}
